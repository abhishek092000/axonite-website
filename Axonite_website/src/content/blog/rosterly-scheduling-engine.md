---
title: "Why we rebuilt Rosterly's scheduling engine from scratch"
date: 2026-07-01
tag: Engineering
excerpt: "The old version worked — until a customer with 400 shift patterns a week found every edge case we hadn't."
---

The old version worked — until a customer with 400 shift patterns a week found every edge case we hadn't.

Scheduling is deceptively difficult. A rule that looks obvious in a small team can become a source of conflicts when shifts, skills, labor rules, and last-minute changes interact at scale.

We rebuilt the engine around explicit constraints and predictable outcomes. The new approach makes conflicts visible before a schedule is published, gives managers a clear explanation for each warning, and keeps the system responsive as teams grow.

The lesson was not that every working system needs a rewrite. It was that a scheduling engine has to make its trade-offs legible to the people who depend on it.
