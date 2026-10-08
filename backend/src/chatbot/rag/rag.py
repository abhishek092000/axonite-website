import os
import uuid
from flask import Blueprint, request, jsonify, current_app
from werkzeug.utils import secure_filename
import pymysql

from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from google import genai

rag_bp = Blueprint("rag_bp", __name__)

UPLOAD_FOLDER = os.path.join(os.getcwd(), "uploads", "knowledge_base")
CHROMA_PERSIST_DIR = os.path.join(os.getcwd(), "chroma_db")
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CHROMA_PERSIST_DIR, exist_ok=True)

# Initialize local HuggingFace embeddings
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2",
    model_kwargs={"device": "cpu"},
)


def get_db_connection():
    config = current_app.config["DB_CONFIG"]
    return pymysql.connect(**config)


def get_vector_store():
    return Chroma(
        persist_directory=CHROMA_PERSIST_DIR,
        embedding_function=embeddings,
        collection_name="company_knowledge",
    )


def extract_text_from_pdf(filepath: str) -> str:
    reader = PdfReader(filepath)
    text = ""
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"
    return text


@rag_bp.route("/rag/documents", methods=["GET"])
def get_documents():
    """Returns all ingested documents stored in MySQL."""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    "SELECT document_id, filename, category, chunk_count, created_at FROM rag_documents ORDER BY created_at DESC"
                )
                docs = cursor.fetchall()
            return jsonify({"success": True, "documents": docs}), 200
        finally:
            conn.close()
    except Exception as e:
        print("Fetch documents error:", repr(e))
        return jsonify({"success": False, "message": "Failed to fetch documents."}), 500


@rag_bp.route("/rag/ingest-document", methods=["POST"])
def ingest_document():
    """Uploads a PDF, chunks its text, creates embeddings, and saves to ChromaDB."""
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "message": "No file uploaded."}), 400

        file = request.files["file"]
        category = request.form.get("category", "company_overview").strip()

        if not file.filename.lower().endswith(".pdf"):
            return jsonify({"success": False, "message": "Only PDF documents are allowed."}), 400

        original_filename = secure_filename(file.filename)
        saved_filename = f"{uuid.uuid4().hex[:8]}_{original_filename}"
        filepath = os.path.join(UPLOAD_FOLDER, saved_filename)
        file.save(filepath)

        # 1. Extract text from PDF
        raw_text = extract_text_from_pdf(filepath)
        if not raw_text.strip():
            os.remove(filepath)
            return jsonify({"success": False, "message": "The PDF contains no readable text."}), 400

        # 2. Chunk text
        splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
        text_chunks = splitter.split_text(raw_text)

        # 3. Add to ChromaDB vector store
        metadatas = [
            {"filename": original_filename, "category": category, "source": saved_filename}
            for _ in text_chunks
        ]
        vector_store = get_vector_store()
        vector_store.add_texts(texts=text_chunks, metadatas=metadatas)

        # 4. Save record in database
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute(
                    """
                    INSERT INTO rag_documents (filename, category, file_path, chunk_count)
                    VALUES (%s, %s, %s, %s)
                    """,
                    (original_filename, category, filepath, len(text_chunks)),
                )
                conn.commit()
        finally:
            conn.close()

        return jsonify({
            "success": True,
            "message": f"Successfully indexed {len(text_chunks)} knowledge chunks.",
            "chunk_count": len(text_chunks),
        }), 201

    except Exception as e:
        print("Ingestion error:", repr(e))
        return jsonify({"success": False, "message": f"Failed to ingest document: {str(e)}"}), 500


@rag_bp.route("/rag/rebuild-index", methods=["POST"])
def rebuild_index():
    """Re-indexes all uploaded PDFs from scratch."""
    try:
        conn = get_db_connection()
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT file_path, filename, category FROM rag_documents")
                records = cursor.fetchall()

            if not records:
                return jsonify({"success": True, "message": "No documents found to index."}), 200

            # Re-initialize vector store
            vector_store = Chroma(
                persist_directory=CHROMA_PERSIST_DIR,
                embedding_function=embeddings,
                collection_name="company_knowledge",
            )
            vector_store.delete_collection()
            vector_store = Chroma(
                persist_directory=CHROMA_PERSIST_DIR,
                embedding_function=embeddings,
                collection_name="company_knowledge",
            )

            splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
            total_chunks = 0

            for doc in records:
                if os.path.exists(doc["file_path"]):
                    text = extract_text_from_pdf(doc["file_path"])
                    if text.strip():
                        chunks = splitter.split_text(text)
                        metadatas = [
                            {"filename": doc["filename"], "category": doc["category"]}
                            for _ in chunks
                        ]
                        vector_store.add_texts(texts=chunks, metadatas=metadatas)
                        total_chunks += len(chunks)

            return jsonify({
                "success": True,
                "message": f"Vector index successfully rebuilt with {total_chunks} chunks.",
            }), 200
        finally:
            conn.close()
    except Exception as e:
        print("Rebuild index error:", repr(e))
        return jsonify({"success": False, "message": "Failed to rebuild index."}), 500


@rag_bp.route("/rag/documents/<int:doc_id>", methods=["DELETE", "OPTIONS"])
def delete_document(doc_id):
    """Deletes the PDF from disk, purges its chunks from ChromaDB, and removes the MySQL record."""
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            # 1. Fetch document metadata
            cursor.execute(
                "SELECT file_path, filename FROM rag_documents WHERE document_id = %s",
                (doc_id,),
            )
            doc = cursor.fetchone()

            if not doc:
                return jsonify({"success": False, "message": "Document not found."}), 404

            file_path = doc["file_path"]
            filename = doc["filename"]

            # 2. Delete the physical PDF file
            if file_path and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except OSError as e:
                    print(f"Warning: Could not remove file {file_path}: {e}")

            # 3. Purge corresponding vector chunks from ChromaDB
            try:
                vector_store = get_vector_store()
                # Chroma allows deleting by metadata filter
                vector_store.delete(where={"filename": filename})
            except Exception as vec_err:
                print(f"Warning: ChromaDB chunk purge error: {vec_err}")

            # 4. Remove record from MySQL
            cursor.execute("DELETE FROM rag_documents WHERE document_id = %s", (doc_id,))
            conn.commit()

        return jsonify({
            "success": True,
            "message": f"'{filename}' and its embeddings were deleted successfully.",
        }), 200

    except Exception as e:
        print("Delete document error:", repr(e))
        return jsonify({"success": False, "message": f"Failed to delete document: {str(e)}"}), 500
    finally:
        conn.close()

@rag_bp.route("/rag/query", methods=["POST"])
def query_knowledge():
    """Public query endpoint for testing raw context retrieval."""
    try:
        data = request.get_json(silent=True) or {}
        user_query = data.get("query", "").strip()

        if not user_query:
            return jsonify({"success": False, "message": "Query parameter is required."}), 400

        vector_store = get_vector_store()
        results = vector_store.similarity_search(user_query, k=3)

        context_chunks = [
            {"content": r.page_content, "metadata": r.metadata} for r in results
        ]

        return jsonify({"success": True, "context": context_chunks}), 200
    except Exception as e:
        print("Query error:", repr(e))
        return jsonify({"success": False, "message": "Failed to query knowledge base."}), 500

@rag_bp.route("/chatbot/chat", methods=["POST", "OPTIONS"])
def chatbot_chat():
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    try:
        data = request.get_json(silent=True) or {}
        message = data.get("message", "").strip()

        if not message:
            return jsonify({"success": False, "reply": "Please enter a message."}), 400

        # Check API Key
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            print("ERROR: GEMINI_API_KEY is not set in environment or .env file.")
            return jsonify({
                "success": False,
                "reply": "Assistant is temporarily unconfigured. Please contact info@axonite.net.",
            }), 500

        # 1. Similarity search in ChromaDB
        docs = []
        try:
            vector_store = get_vector_store()
            docs = vector_store.similarity_search(message, k=3)
        except Exception as vec_err:
            print(f"Warning: Vector search issue (empty DB or unindexed): {vec_err}")

        context = "\n\n".join([doc.page_content for doc in docs]) if docs else ""

        # 2. Build system instruction prompt with injected context
        system_prompt = f"""
You are the official AI assistant for Axonite.
Answer the user's inquiry using only the following company documents:

---
{context if context else "No specific internal document found. Provide polite general assistance."}
---

Guidelines:
- If the answer is not in the company documents, politely suggest contacting info@axonite.net.
- Keep responses professional, clear, and concise.
"""

        # 3. Call Gemini
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=f"{system_prompt}\n\nUser Question: {message}",
        )

        sources = list(set([
            d.metadata.get("filename") for d in docs if d.metadata and d.metadata.get("filename")
        ]))

        return jsonify({
            "success": True,
            "reply": response.text,
            "sources": sources,
        }), 200

    except Exception as e:
        # Print full traceback to terminal
        print("=" * 50)
        print("CHATBOT 500 ERROR TRACEBACK:")
        traceback.print_exc()
        print("=" * 50)
        return jsonify({
            "success": False,
            "reply": "I'm having trouble answering right now. Please reach out to info@axonite.net.",
            "error_details": str(e),
        }), 500