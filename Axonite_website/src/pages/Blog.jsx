import { API_BASE_URL } from "../lib/api";
import { useEffect, useRef, useState } from "react";
import Reveal from "../components/Reveal";
import CloudBackground from "../components/CloudBackground";


function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function PostTag({ tag }) {
  if (!tag) return null;
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-paper-alt px-3.5 py-1 text-[0.72rem] font-medium text-ink-2 shadow-xs">
      {tag}
    </span>
  );
}

function PostMedia({ post, className }) {
  if (post.video) {
    return <video src={post.video} controls className={className} />;
  }
  if (!post.image) return null;
  return <img src={post.image} alt="" className={className} />;
}

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activePost, setActivePost] = useState(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch(`${API_BASE_URL}/blog`);
        const data = await response.json();
        const formatted = (Array.isArray(data) ? data : []).map((p, i) => ({
          id: p.id || p.blog_id || `post-${i}`,
          title: p.title || p.blog_title || "",
          tag: p.tag || p.blog_sub_title || "",
          excerpt: p.excerpt || p["blog content"] || "",
          image: p.image || p.blog_image || "",
          video: p.video || p.blog_video || "",
          date: p.formatted_date || formatDisplayDate(p.raw_date || p.created_date),
        }));
        setPosts(formatted);
      } catch (err) {
        console.error("Error fetching blog posts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  if (!loading && posts.length === 0) {
    return (
      <div className="bg-paper">
        <BlogHero />
        <BlogEmpty />
      </div>
    );
  }

  const [featured, ...rest] = posts;
  const listPosts = rest.slice(0, 3);
  const morePosts = rest.slice(3);

  return (
    <div className="bg-paper min-h-screen">
      {/* YOUR ORIGINAL HERO SECTION */}
      <BlogHero count={posts.length} />

      <section className="relative max-w-container mx-auto px-6 py-20">
        <CloudBackground showGrid={true} />

        {loading && <BlogSkeleton />}

        {!loading && featured && (
          <div className="relative z-10">
            {/* Split layout matching the clean visual style */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
              
              {/* LEFT: Featured Post (Large card) */}
              <div className="lg:col-span-6 xl:col-span-6">
                <Reveal>
                  <article
                    onClick={() => setActivePost(featured)}
                    className="group cursor-pointer flex flex-col"
                  >
                    {(featured.image || featured.video) && (
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] bg-paper-alt shadow-sm">
                        <PostMedia
                          post={featured}
                          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        />
                      </div>
                    )}

                    <div className="mt-6 space-y-3">
                      <h2 className="text-2xl sm:text-[1.85rem] font-medium tracking-tight text-ink leading-[1.25] group-hover:text-accent transition-colors">
                        {featured.title}
                      </h2>

                      {featured.excerpt && (
                        <p className="text-ink-2 text-[0.95rem] leading-relaxed line-clamp-2">
                          {featured.excerpt}
                        </p>
                      )}

                      <div className="pt-1">
                        <PostTag tag={featured.tag} />
                      </div>
                    </div>
                  </article>
                </Reveal>
              </div>

              {/* RIGHT: 3 Stacked Horizontal Rows */}
              <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-between space-y-8 sm:space-y-9">
                {listPosts.map((post, i) => (
                  <Reveal key={post.id} delay={i * 80}>
                    <article
                      onClick={() => setActivePost(post)}
                      className="group cursor-pointer grid grid-cols-[140px_1fr] sm:grid-cols-[165px_1fr] gap-5 sm:gap-6 items-center"
                    >
                      {(post.image || post.video) && (
                        <div className="relative aspect-square w-full overflow-hidden rounded-[1.35rem] bg-paper-alt shadow-sm">
                          <PostMedia
                            post={post}
                            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        </div>
                      )}

                      <div className="flex flex-col justify-center space-y-1.5">
                        <h3 className="text-lg sm:text-[1.2rem] font-medium tracking-tight text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>

                        {post.excerpt && (
                          <p className="text-ink-2 text-[0.875rem] leading-relaxed line-clamp-2">
                            {post.excerpt}
                          </p>
                        )}

                        <div className="pt-1.5">
                          <PostTag tag={post.tag} />
                        </div>
                      </div>
                    </article>
                  </Reveal>
                ))}
              </div>

            </div>

            {/* Remaining Posts Grid (if more than 4 posts exist) */}
            {morePosts.length > 0 && (
              <div className="mt-24 pt-12 border-t border-line">
                <h3 className="eyebrow mb-8">
                  More Articles
                </h3>
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3">
                  {morePosts.map((post, i) => (
                    <Reveal key={post.id} delay={Math.min(i, 5) * 80}>
                      <article
                        onClick={() => setActivePost(post)}
                        className="group cursor-pointer space-y-3"
                      >
                        {(post.image || post.video) && (
                          <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-paper-alt shadow-sm">
                            <PostMedia
                              post={post}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        )}
                        <h4 className="text-[1.05rem] font-medium tracking-tight text-ink leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                          {post.title}
                        </h4>
                        <div>
                          <PostTag tag={post.tag} />
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {activePost && (
        <PostReader post={activePost} onClose={() => setActivePost(null)} />
      )}
    </div>
  );
}

/* --- YOUR EXACT ORIGINAL HERO SECTION --- */
function BlogHero({ count = 0 }) {
  return (
    <section className="relative bg-paper ambient-wash overflow-hidden pt-32 pb-16 section-rule">
      <div className="relative max-w-prose mx-auto px-6">
        <p className="eyebrow mb-5">Writing</p>
        <h1 className="text-display max-w-[22ch]">
          Notes from building product software.
        </h1>
        <p className="mt-6 max-w-[52ch] text-[1.125rem] leading-relaxed text-ink-2">
          Engineering decisions, design trade-offs, and the occasional
          postmortem — written by the people who did the work.
        </p>
        {count > 0 && (
          <p className="mt-8 font-mono-label text-[0.68rem] text-ink-3">
            {count} {count === 1 ? "post" : "posts"} published
          </p>
        )}
      </div>
    </section>
  );
}

function BlogEmpty() {
  return (
    <section className="max-w-container mx-auto px-6 py-24">
      <div className="max-w-[620px] mx-auto card px-8 py-14 text-center">
        <h2 className="text-display-xs">
          Nothing published yet.
        </h2>
        <p className="text-ink-2 text-[0.95rem] leading-relaxed mt-4">
          We're working on the first few write-ups. In the meantime, tell us
          what you'd want to read about.
        </p>
      </div>
    </section>
  );
}

function BlogSkeleton() {
  return (
    <div aria-hidden="true" className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 animate-pulse">
      <div className="lg:col-span-6 space-y-4">
        <div className="aspect-[4/3] rounded-[2rem] bg-paper-alt" />
        <div className="h-6 w-3/4 rounded-md bg-paper-alt mt-4" />
        <div className="h-4 w-1/2 rounded-md bg-paper-alt" />
        <div className="h-6 w-20 rounded-full bg-paper-alt" />
      </div>
      <div className="lg:col-span-6 space-y-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="grid grid-cols-[165px_1fr] gap-6 items-center">
            <div className="aspect-square rounded-[1.35rem] bg-paper-alt" />
            <div className="space-y-3">
              <div className="h-5 w-4/5 rounded-md bg-paper-alt" />
              <div className="h-3 w-full rounded-md bg-paper-alt" />
              <div className="h-6 w-16 rounded-full bg-paper-alt" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

function PostReader({ post, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const opener = document.activeElement;
    closeRef.current?.focus();

    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;

      const items = dialogRef.current?.querySelectorAll(FOCUSABLE);
      if (!items || items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-dark/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="post-reader-title"
        className="relative w-full max-w-3xl max-h-[90vh] rounded-lg bg-paper border border-line shadow-float overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-md px-6 sm:px-8 py-4 border-b border-line flex items-center justify-between gap-4">
          <span className="eyebrow">Article</span>

          <button
            type="button"
            ref={closeRef}
            onClick={onClose}
            aria-label="Close article"
            className="w-9 h-9 shrink-0 rounded-full border border-line text-ink-3 hover:text-paper hover:bg-dark flex items-center justify-center transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path
                d="M1 1l12 12M13 1L1 13"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 sm:px-10 py-8 overflow-y-auto flex-1">
          <h2
            id="post-reader-title"
            className="text-display-xs"
          >
            {post.title}
          </h2>

          {post.tag && <div className="mt-3"><PostTag tag={post.tag} /></div>}

          {(post.image || post.video) && (
            <PostMedia
              post={post}
              className="w-full max-h-96 rounded-md border border-line object-cover bg-paper-alt mt-7"
            />
          )}

          <div className="text-ink-2 text-[1.05rem] leading-relaxed whitespace-pre-line mt-7">
            {post.excerpt}
          </div>
        </div>
      </div>
    </div>
  );
}