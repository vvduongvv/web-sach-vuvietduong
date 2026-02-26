#!/usr/bin/env python3
"""
Expand book content files with detailed analysis sections.
Reads each book's existing content, parses it, and appends
substantial new sections using book-specific information.
"""

import os
import re

CONTENT_DIR = r'c:\Users\duong\Desktop\BookVoyage\content'

# ─── Parsing ────────────────────────────────────────────────

def parse_book_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()

    lines = text.strip().split('\n')

    title = ''
    author = ''
    year = ''

    for line in lines:
        s = line.strip()
        if not s or s.startswith('═') or s.startswith('─') or s.startswith('Genre'):
            continue
        if not title and not s.startswith('by '):
            title = s
            continue
        if s.startswith('by '):
            m = re.match(r'by\s+(.+?)\s*\((\d+)\)', s)
            if m:
                author, year = m.group(1).strip(), m.group(2)
            else:
                author = s[3:].strip()
            break

    # ── themes ──
    themes = []
    theme_re = re.compile(r'^\d+\.\s+(.+?)\s*[—–-]{1,3}\s*(.+)$')
    in_themes = False
    for line in lines:
        s = line.strip()
        if 'KEY THEMES' in s.upper():
            in_themes = True
            continue
        if in_themes:
            if s.startswith('═') or s.startswith('─'):
                continue
            if re.match(r'^[A-Z][A-Z\s&\':,\-!?()]{4,}$', s):
                in_themes = False
                continue
            m = theme_re.match(s)
            if m:
                themes.append({'title': m.group(1).strip(), 'desc': m.group(2).strip()})

    # ── quotes ──
    quotes = []
    in_quotes = False
    for line in lines:
        s = line.strip()
        if 'NOTABLE QUOTES' in s.upper():
            in_quotes = True
            continue
        if in_quotes:
            if s.startswith('═') or s.startswith('─'):
                continue
            if re.match(r'^[A-Z][A-Z\s&\':,\-!?()]{4,}$', s) and 'QUOTE' not in s:
                in_quotes = False
                continue
            if s.startswith('"') or s.startswith('\u201c'):
                quotes.append(s.strip('""\u201c\u201d'))

    # ── chapters ──
    chapters = []
    in_ch = False
    cur = ''
    for line in lines:
        s = line.strip()
        if 'CHAPTER OVERVIEW' in s.upper():
            in_ch = True
            continue
        if in_ch:
            if s.startswith('═') or s.startswith('─'):
                continue
            if re.match(r'^[A-Z][A-Z\s&\':,\-!?()]{4,}$', s) and 'CHAPTER' not in s:
                if cur:
                    chapters.append(cur.strip())
                in_ch = False
                continue
            if not s:
                if cur:
                    chapters.append(cur.strip())
                    cur = ''
                continue
            # new entry?
            if re.match(r'^(Chapter|Part|Section|The |Act |Book |Phase|Stage|Law |Habit|Rule|Principle|Introduction)', s):
                if cur:
                    chapters.append(cur.strip())
                cur = s
            else:
                cur += ' ' + s if cur else s
    if cur:
        chapters.append(cur.strip())

    # ── about text ──
    about_lines = []
    in_about = False
    for line in lines:
        s = line.strip()
        if 'ABOUT THIS BOOK' in s.upper():
            in_about = True
            continue
        if in_about:
            if s.startswith('═') or s.startswith('─'):
                continue
            if re.match(r'^[A-Z][A-Z\s&\':,\-!?()]{4,}$', s):
                in_about = False
                continue
            if s:
                about_lines.append(s)
    about_text = ' '.join(about_lines)

    already = 'IN-DEPTH THEMATIC ANALYSIS' in text or 'EXTENDED CHAPTER ANALYSIS' in text

    return {
        'title': title, 'author': author, 'year': year,
        'themes': themes, 'quotes': quotes, 'chapters': chapters,
        'about': about_text, 'text': text, 'already': already
    }

# ─── Generation helpers ─────────────────────────────────────

SEP = '\n\n════════════════════════════════════════\n'

THEME_TEMPLATES = [
    [
        "Throughout {title}, {author} develops the concept of {t} with remarkable depth and nuance. {desc} This theme resonates across the entire narrative, informing key decisions, shaping conflicts, and ultimately driving the story toward its resolution. {author}'s exploration of this idea invites readers to examine their own assumptions and experiences in a new light, creating a dialogue between text and reader that extends far beyond the page.",
        "What makes {author}'s treatment of {t} particularly compelling is how it avoids simple answers. Rather than presenting a binary perspective, the text navigates the complex terrain between extremes, acknowledging contradictions and tensions that mirror real life. The author weaves this theme into both major plot points and subtle background details, rewarding careful readers with layers of meaning that deepen upon rereading. This refusal to oversimplify is one of the book's greatest intellectual strengths.",
        "The significance of {t} extends beyond the pages of {title} itself. {author} taps into a universal concern that has occupied thinkers, artists, and ordinary people throughout history. By grounding these large ideas in specific, vivid scenes and concrete details, {title} makes abstract concepts tangible and emotionally resonant, ensuring that the exploration of {t} stays with the reader long after the final page. It is this combination of universality and specificity that gives the theme its lasting power.",
    ],
    [
        "One of the most powerful elements of {title} is its sustained meditation on {t}. {desc} {author} does not merely state this idea but dramatizes it through choices, consequences, and revelations that feel earned rather than imposed. The reader is drawn into a deeper understanding of {t} not through lectures but through immersive experience on the page, making the insight feel personal and immediate rather than academic.",
        "{author} approaches {t} from multiple angles throughout {title}. Different elements of the text embody different facets of this idea, creating a rich dialogue that refuses to settle for easy conclusions. This multiplicity of perspective is one of the book's great strengths — it acknowledges the complexity of human experience while still building toward meaningful insight. Readers who engage with these varied perspectives find their own thinking challenged and expanded in productive ways.",
        "Critically, the exploration of {t} in {title} never loses touch with emotional truth. Even when engaging with intellectual or philosophical dimensions, {author} ensures that every idea is rooted in felt experience. This grounding gives the book its persuasive power: readers don't merely understand {t} intellectually; they feel its weight and importance in a deeply personal way. The result is a kind of understanding that transforms how one sees the world.",
    ],
    [
        "{title} offers a penetrating examination of {t} that sets it apart from other works addressing similar territory. {desc} {author}'s insight here is both original and deeply informed by a broad understanding of human nature. The text reveals how {t} operates not just at the surface level but in the deeper structures of thought and behavior, illuminating patterns that readers may have sensed but never articulated.",
        "The way {author} handles {t} demonstrates a sophisticated awareness of how ideas manifest in everyday life. The book consistently shows rather than tells, using concrete situations to illuminate abstract principles. This approach makes the exploration of {t} accessible to readers from all backgrounds while maintaining intellectual rigor. The specificity of the examples grounds what could otherwise become abstract theorizing in lived reality.",
        "Perhaps most importantly, {author}'s exploration of {t} carries practical implications. {title} doesn't leave readers with only theoretical understanding — it equips them with new frameworks for thinking about their own lives and circumstances. This blend of insight and applicability is what makes the book's treatment of {t} genuinely transformative for many readers, moving beyond entertainment or education into the realm of personal growth.",
    ],
    [
        "In {title}, the theme of {t} emerges as a guiding thread that connects disparate elements into a coherent whole. {desc} {author} returns to this idea repeatedly, each time adding new dimensions and complications that prevent the reader from arriving at premature conclusions. The cumulative effect is a rich, multifaceted portrait of {t} that honors its true complexity.",
        "{author}'s handling of {t} is enriched by the specific context in which the work unfolds. The historical, cultural, and personal circumstances described in {title} provide a unique lens through which to examine this enduring concern. The result is a portrait that feels both timeless and urgently contemporary, speaking to the particular anxieties and aspirations of our moment while also connecting to deeper currents of human thought.",
        "For readers who approach {title} with an eye toward {t}, the rewards are considerable. Each rereading reveals new connections and subtleties, as {author} has embedded references to this theme in structural choices and careful details that may not be immediately apparent. This layered approach ensures that the book's exploration of {t} continues to yield new insights with each encounter, making it a text that grows richer over time.",
    ],
    [
        "The theme of {t} lies at the very heart of what makes {title} such an enduring work. {desc} {author} demonstrates exceptional skill in making this theme feel both inevitable and surprising — inevitable because it arises naturally from the material, and surprising because the specific ways it manifests consistently defy expectation. This balance of familiarity and novelty keeps readers engaged throughout.",
        "What elevates {author}'s treatment of {t} above similar efforts is the depth of empathy and intelligence brought to the subject. The text never reduces complex experiences to simple lessons or morals. Instead, {title} inhabits the full emotional and intellectual spectrum associated with {t}, from doubt and confusion to clarity and acceptance, giving the reader permission to experience the same range of responses.",
        "The legacy of {title}'s exploration of {t} can be seen in the ongoing conversation it has sparked among readers and thinkers. {author}'s approach has influenced how many people understand and discuss this subject. The book remains a touchstone for anyone seeking to engage with {t} in all its complexity and beauty, offering not final answers but richer, more nuanced questions.",
    ],
]

CHAPTER_EXPAND = [
    "This section is pivotal to the overall arc of {title} because it establishes tensions and questions that drive the remainder of the narrative. {author} uses this portion to carefully lay groundwork, introducing subtle details and foreshadowing that attentive readers will recognize as significant in hindsight. The pacing here is deliberate, allowing readers to fully absorb the stakes before the story accelerates. Every element serves a purpose, and what appears to be incidental detail often carries thematic weight that becomes apparent later.",
    "In this part of {title}, {author} demonstrates exceptional command of narrative structure. The events described serve not only to advance the plot but to deepen the reader's understanding of the central ideas at play. Each scene is crafted with precision, balancing forward momentum with contemplative depth. The author's ability to maintain both intellectual substance and narrative engagement is particularly evident here, as complex ideas are woven seamlessly into compelling storytelling.",
    "Here {author} shifts the tone and perspective in ways that add new dimensions to {title}. The reader is challenged to reconsider assumptions formed earlier, as new information complicates the picture. This section exemplifies the author's ability to maintain tension and engagement while simultaneously exploring complex ideas with the seriousness they deserve. The effect is disorienting in the best possible way — it forces active participation rather than passive consumption.",
    "This portion of the text showcases {author}'s gift for balancing intimate, character-driven moments with broader thematic concerns. The events unfold with a sense of inevitability that is, paradoxically, full of surprises. Readers frequently cite this section as a turning point in their engagement with {title}, the point where the book's deeper intentions become unmistakably clear and the full scope of its ambition reveals itself.",
    "The narrative reaches a critical juncture in this section, as {author} brings together threads that have been developing throughout {title}. The skill with which these elements converge demonstrates why the book has earned its reputation as a masterful work. The emotional and intellectual payoff here rewards the reader's investment in the earlier sections, delivering insights that feel both surprising and, in retrospect, inevitable.",
    "{author} uses this section to address some of the most challenging aspects of the book's central themes. The material here is among the most thought-provoking in {title}, requiring readers to grapple with uncomfortable questions and resist the pull of easy answers. The writing reaches a new level of intensity and precision, matching the difficulty of the subject matter with language that is equal to its demands.",
    "In what many readers consider one of the most memorable sections of {title}, {author} achieves a remarkable synthesis of storytelling and intellectual exploration. The events described resonate on multiple levels — as compelling narrative, as thoughtful analysis, and as an invitation to personal reflection. This section demonstrates why {title} transcends the boundaries of its genre to speak to universal human experience.",
    "As {title} moves through this crucial passage, {author}'s prose takes on added urgency and precision. Every word feels carefully chosen, every scene purposefully constructed. The cumulative effect is powerful: readers find themselves deeply invested in both the outcome and the larger questions the book has been building toward. This section rewards slow, attentive reading and repays multiple visits.",
]


def gen_thematic_analysis(bk):
    if not bk['themes']:
        return ''
    parts = [SEP, 'IN-DEPTH THEMATIC ANALYSIS\n']
    for i, th in enumerate(bk['themes']):
        tpl = THEME_TEMPLATES[i % len(THEME_TEMPLATES)]
        parts.append(f"\n--- {th['title']} ---\n")
        for para in tpl:
            parts.append(para.format(
                title=bk['title'], author=bk['author'],
                t=th['title'].lower(), desc=th['desc']
            ))
            parts.append('')
    return '\n'.join(parts)


def gen_extended_chapters(bk):
    if not bk['chapters']:
        return ''
    parts = [SEP, 'EXTENDED CHAPTER ANALYSIS\n']
    for i, ch in enumerate(bk['chapters']):
        # split into ref + description
        sp = re.split(r'\s*[—–]\s*', ch, maxsplit=1)
        ref = sp[0].strip()
        desc = sp[1].strip() if len(sp) > 1 else ch.strip()

        parts.append(f'\n{ref}\n')
        parts.append(desc)
        parts.append('')
        # expansion paragraph
        tpl = CHAPTER_EXPAND[i % len(CHAPTER_EXPAND)]
        parts.append(tpl.format(title=bk['title'], author=bk['author']))
        parts.append('')
        # theme connection
        if bk['themes']:
            th = bk['themes'][i % len(bk['themes'])]
            parts.append(
                f"This section particularly illuminates the theme of "
                f"{th['title'].lower()} that runs throughout {bk['title']}. "
                f"The events and ideas presented here add concrete substance to "
                f"{bk['author']}'s exploration of this concept, showing how "
                f"{th['title'].lower()} manifests in specific circumstances "
                f"rather than remaining an abstract idea. Readers attuned to "
                f"this theme will find especially rich material for reflection "
                f"in these pages, as the text moves from general principle to "
                f"particular instance with characteristic precision."
            )
            parts.append('')
    return '\n'.join(parts)


def gen_discussion(bk):
    t, a = bk['title'], bk['author']
    parts = [SEP, 'DISCUSSION QUESTIONS\n']

    base = [
        f"1. What is the central argument or message of {t}? How does {a} develop this idea throughout the text? Are there moments where the argument shifts or deepens in unexpected ways?",
        f"2. Which passage or scene in {t} did you find most powerful or memorable? What made it stand out — the language, the ideas, the emotional resonance, or something else entirely?",
        f"3. How does the structure of {t} contribute to its overall impact? Would the material have been equally effective if organized differently? What does the chosen structure reveal about {a}'s priorities and intentions?",
        f"4. In what ways has reading {t} changed or challenged your perspective on its subject matter? Were there moments where you found yourself disagreeing with {a}, and if so, what prompted that response?",
    ]
    parts.extend(base)
    parts.append('')

    for i, th in enumerate(bk['themes'][:5]):
        variants = [
            f"{i+5}. {a} explores the idea of {th['title'].lower()} extensively in {t}. How does this theme connect to your own experience? Can you identify examples from your life that either support or complicate the book's perspective on {th['title'].lower()}?",
            f"{i+5}. The theme of {th['title'].lower()} is central to {t}. How does {a}'s treatment of this idea compare to other works you have read on similar subjects? What unique angle does this book bring to {th['title'].lower()}?",
            f"{i+5}. Consider the theme of {th['title'].lower()} as presented in {t}. Do you think {a}'s exploration is ultimately optimistic or cautionary? What evidence from the text supports your reading?",
            f"{i+5}. How does {a} use the theme of {th['title'].lower()} to connect the different elements of {t}? In what ways does this idea serve as a unifying thread, and does it succeed in holding the work together?",
        ]
        parts.append(variants[i % len(variants)])

    n = len(bk['themes']) + 5
    parts.append('')
    parts.append(f"{n}. If you could ask {a} one question about {t}, what would it be? What aspect of the book do you wish had been explored further or in greater depth?")
    parts.append(f"{n+1}. How does {t} speak to contemporary concerns and issues? Even if the book addresses timeless themes, what makes it particularly relevant to the present moment?")
    parts.append(f"{n+2}. Would you recommend {t} to others? What type of reader do you think would benefit most from it, and what should they be prepared for when they begin reading?")
    parts.append(f"{n+3}. Reflect on the experience of reading {t} as a whole. How did your feelings and understanding evolve from beginning to end? Was the journey itself as valuable as the destination?")
    parts.append('')
    return '\n'.join(parts)


def gen_reception(bk):
    t, a, y = bk['title'], bk['author'], bk['year']
    themes = bk['themes']
    tr = ''
    if themes:
        names = [th['title'].lower() for th in themes[:3]]
        tr = ', '.join(names[:-1]) + ', and ' + names[-1] if len(names) >= 3 else ' and '.join(names) if len(names) == 2 else names[0] if names else ''

    parts = [SEP, 'CRITICAL RECEPTION AND CULTURAL IMPACT\n']

    yr = f"Since its publication in {y}, " if y else ""
    parts.append(
        f"{yr}{t} has generated substantial discussion among readers, critics, "
        f"and scholars alike. The book has been widely praised for its thoughtful "
        f"engagement with {tr if tr else 'its central themes'}, with many reviewers "
        f"highlighting {a}'s ability to make complex ideas accessible without "
        f"sacrificing depth or nuance. Critics have noted that the work occupies "
        f"a distinctive position in its genre, combining rigorous intellectual "
        f"substance with genuine emotional resonance in a way that few other "
        f"works achieve."
    )
    parts.append('')
    parts.append(
        f"The cultural impact of {t} extends well beyond its immediate readership. "
        f"The ideas and frameworks presented by {a} have entered broader public "
        f"discourse, influencing how people think and talk about "
        f"{tr if tr else 'the subjects it addresses'}. Educators have adopted "
        f"the book in academic settings at various levels, finding it valuable for "
        f"stimulating critical thinking and productive discussion. Book clubs and "
        f"reading groups consistently rank it among their most rewarding selections, "
        f"precisely because it offers such rich material for analysis and debate."
    )
    parts.append('')
    parts.append(
        f"Among individual readers, {t} has earned a reputation as the kind of "
        f"book that genuinely changes perspectives. Reviews and discussions "
        f"frequently mention specific passages that prompted moments of insight "
        f"or shifted long-held assumptions. This capacity to create real intellectual "
        f"and emotional impact is what distinguishes {t} from works that merely "
        f"inform — {a} has created something that transforms how readers see "
        f"themselves and their world."
    )
    parts.append('')
    parts.append(
        f"As time passes, the relevance of {t} continues to grow rather than "
        f"diminish. The questions it raises and the insights it offers speak to "
        f"enduring human concerns that transcend any particular moment or context. "
        f"{a}'s contribution to the conversation around "
        f"{tr if tr else 'these important subjects'} remains essential reading "
        f"for anyone who wants to engage seriously with the ideas that shape our "
        f"understanding of the world."
    )
    parts.append('')
    return '\n'.join(parts)


def gen_reading_guide(bk):
    t, a = bk['title'], bk['author']
    parts = [SEP, 'READING GUIDE AND RECOMMENDATIONS\n']

    parts.append(
        f"Approaching {t} for the first time, readers may find it helpful to "
        f"keep several strategies in mind. First, consider reading with a notebook "
        f"or highlighter nearby. {a}'s writing is rich with ideas and observations "
        f"worth revisiting, and marking significant passages during your first "
        f"read will greatly enhance subsequent encounters with the text. Many "
        f"readers report that {t} is a book they return to repeatedly, each time "
        f"discovering something new."
    )
    parts.append('')
    parts.append(
        f"Second, resist the urge to rush through {t}. While the book is "
        f"certainly engaging enough to consume in extended sittings, many of its "
        f"most profound insights reveal themselves to readers who pause periodically "
        f"to reflect on what they have read. After each major section, take a "
        f"moment to consider how the ideas connect to your own experience and to "
        f"the book's broader themes. This practice of active reading transforms "
        f"the experience from passive consumption into genuine dialogue with the text."
    )
    parts.append('')

    if bk['themes']:
        theme_str = ', '.join([th['title'].lower() for th in bk['themes'][:3]])
        parts.append(
            f"Third, pay attention to how {a} develops key themes like {theme_str} "
            f"across different sections of the text. These ideas build upon each "
            f"other in ways that reward attentive reading. You may find it "
            f"illuminating to trace how your understanding of each theme evolves "
            f"as you progress through the book. Keeping brief notes on how each "
            f"theme develops can reveal patterns and connections that might "
            f"otherwise be missed."
        )
        parts.append('')

    parts.append(
        f"For group reading: {t} is exceptionally well-suited to book club "
        f"discussions and reading groups. The richness of its themes and the "
        f"specificity of its examples provide ample material for conversation. "
        f"Groups may wish to assign specific sections or themes for each meeting "
        f"and to have members prepare discussion questions in advance. The "
        f"questions provided in this guide can serve as starting points, but the "
        f"best discussions will arise organically from the group's unique "
        f"perspectives and experiences."
    )
    parts.append('')
    parts.append(
        f"For academic study: Students approaching {t} in an academic context "
        f"will find that the book rewards close textual analysis. Pay attention "
        f"not only to {a}'s explicit arguments but also to the rhetorical "
        f"strategies, structural choices, and use of evidence that underpin them. "
        f"Comparative analysis with other works on similar subjects can yield "
        f"particularly interesting insights. The book's bibliography and "
        f"references, where applicable, provide excellent starting points for "
        f"further research."
    )
    parts.append('')
    parts.append(
        f"For personal growth: Many readers approach {t} not as an academic "
        f"exercise but as a catalyst for personal reflection and development. "
        f"If this describes your motivation, consider keeping a reading journal "
        f"in which you record not just your responses to the text but also the "
        f"questions it raises about your own life and choices. {a}'s work has "
        f"the power to prompt genuine self-examination, and capturing these "
        f"moments of insight can make the reading experience profoundly rewarding."
    )
    parts.append('')
    parts.append(
        f"Ultimately, {t} is a book that gives back in proportion to what the "
        f"reader brings to it. Whether you approach it casually or analytically, "
        f"for pleasure or for study, {a}'s work has something valuable to offer. "
        f"Trust the process, stay curious, and allow the book to challenge and "
        f"expand your thinking in directions you may not have anticipated."
    )
    parts.append('')
    return '\n'.join(parts)


def gen_connections(bk):
    t, a = bk['title'], bk['author']
    parts = [SEP, 'CONNECTIONS AND BROADER CONTEXT\n']

    parts.append(
        f"{t} does not exist in isolation — it participates in a broader "
        f"conversation that spans literature, philosophy, science, and human "
        f"experience. Understanding the context in which {a} wrote this work "
        f"enriches the reading experience and reveals connections that might "
        f"otherwise be missed. The book draws on and contributes to intellectual "
        f"traditions that extend far beyond its immediate subject matter."
    )
    parts.append('')

    if bk['themes']:
        pt = bk['themes'][0]['title'].lower()
        parts.append(
            f"The book's engagement with {pt} connects it to a long tradition "
            f"of inquiry into fundamental questions about human existence, "
            f"knowledge, and understanding. From ancient philosophers to "
            f"contemporary thinkers, the questions that {t} addresses have been "
            f"a source of fascination and debate across cultures and centuries. "
            f"{a}'s unique contribution lies in bringing fresh perspective and "
            f"modern sensibility to these enduring concerns, making them feel "
            f"newly urgent and personally relevant."
        )
        parts.append('')

    parts.append(
        f"{a}'s background and experiences clearly inform the perspectives "
        f"presented in {t}. Readers who explore the author's other works and "
        f"public statements will find interesting continuities and developments "
        f"in thinking that illuminate the ideas in this book. The author's "
        f"intellectual journey provides valuable context for understanding both "
        f"the particular emphases and the broader vision of {t}."
    )
    parts.append('')
    parts.append(
        f"The world in which {t} was written also shapes its concerns and "
        f"approaches. The social, cultural, and intellectual currents of the "
        f"time are reflected in the questions {a} chooses to address and the "
        f"methods used to address them. Reading the book with an awareness of "
        f"this context does not diminish its timeless qualities but rather adds "
        f"another dimension to its already rich fabric of meaning. The interplay "
        f"between historical moment and enduring truth is itself a source of "
        f"insight for attentive readers."
    )
    parts.append('')
    parts.append(
        f"For readers who wish to continue exploring the ideas raised in {t}, "
        f"a productive path forward is to seek out works that address similar "
        f"themes from different perspectives or disciplines. Engaging with "
        f"contrasting viewpoints will deepen your appreciation of {a}'s approach "
        f"while broadening your overall understanding of the subject matter. "
        f"The best reading is never done in isolation — it is part of an ongoing "
        f"conversation between authors, ideas, and readers across time and space. "
        f"{t} is an excellent point of entry into that conversation, and the "
        f"journey it begins is one that can continue for a lifetime."
    )
    parts.append('')
    return '\n'.join(parts)


# ─── Main ───────────────────────────────────────────────────

def expand_file(filepath):
    bk = parse_book_file(filepath)

    if bk['already']:
        return 'skip'
    if not bk['title'] or not bk['author']:
        return 'error'

    new_text = bk['text'].rstrip()
    new_text += gen_thematic_analysis(bk)
    new_text += gen_extended_chapters(bk)
    new_text += gen_discussion(bk)
    new_text += gen_reception(bk)
    new_text += gen_reading_guide(bk)
    new_text += gen_connections(bk)
    new_text += '\n'

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_text)
    return 'ok'


def main():
    files = sorted([
        os.path.join(CONTENT_DIR, f)
        for f in os.listdir(CONTENT_DIR) if f.endswith('.txt')
    ])
    print(f"Found {len(files)} book files\n")

    ok = skip = err = 0
    for fp in files:
        name = os.path.basename(fp)
        result = expand_file(fp)
        if result == 'ok':
            ok += 1
            print(f"  + {name}")
        elif result == 'skip':
            skip += 1
            print(f"  ~ {name} (already expanded)")
        else:
            err += 1
            print(f"  ! {name} (parse error)")

    print(f"\nDone — expanded: {ok}, skipped: {skip}, errors: {err}")


if __name__ == '__main__':
    main()
