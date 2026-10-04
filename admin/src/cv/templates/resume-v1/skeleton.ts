/**
 * resume-v1's document: the Consolidated CV's preamble, followed by the commands
 * the renderer calls in place of its hand-tuned body. `render.ts` fills in
 * `{{OPTIONS}}`, `{{HEADER}}` and `{{BODY}}`.
 *
 * A TypeScript string rather than a .tex file, so the browser, the Worker and
 * Node all load it with no loader configured. String.raw keeps every backslash;
 * the text can hold no backtick, which LaTeX here never needs.
 */
export const skeleton = String.raw`\documentclass[letterpaper,11pt]{article}

\usepackage{latexsym}
\usepackage[empty]{fullpage}
\usepackage{titlesec}
\usepackage{marvosym}
\usepackage[usenames,dvipsnames]{color}
\usepackage{verbatim}
\usepackage{enumitem}
\usepackage[hidelinks]{hyperref}
\usepackage{fancyhdr}
\usepackage[english]{babel}
\usepackage{tabularx}
\usepackage{setspace}
\input{glyphtounicode}
\usepackage{multicol}

\pagestyle{fancy}
\fancyhf{}
\fancyfoot{}
\renewcommand{\headrulewidth}{0pt}
\renewcommand{\footrulewidth}{0pt}

% Margins
\addtolength{\oddsidemargin}{-0.5in}
\addtolength{\evensidemargin}{-0.5in}
\addtolength{\textwidth}{1in}
\addtolength{\topmargin}{-.5in}
\addtolength{\textheight}{1.0in}

\urlstyle{same}
\raggedbottom
\raggedright
\setlength{\tabcolsep}{0in}

% Section headings: small capitals over a rule
\titleformat{\section}{\vspace{-6pt}\scshape\raggedright\large}{}{0em}{}[\color{black}\titlerule \vspace{-5pt}]

% Keep the PDF's text machine-readable for applicant tracking systems
\pdfgentounicode=1

\renewcommand\labelitemii{$\vcenter{\hbox{\tiny$\bullet$}}$}

%-------------------------------------------------------------------------------
% Options, from the preset
{{OPTIONS}}

%-------------------------------------------------------------------------------
% The commands the renderer calls. The body below is generated and uses only
% these, so every CV built from this template is laid out the same way.

\newcommand{\cvHeader}[2]{%
  \begin{center}
    \textbf{\Huge \scshape #1} \\ \vspace{1pt}
    \small #2
  \end{center}}

% A wrapping table column, set ragged-right like the rest of the page
\newcolumntype{L}[1]{>{\raggedright\arraybackslash}p{#1}}

% A list of headed entries, with blank labels
\newcommand{\cvEntriesStart}{\begin{itemize}[leftmargin=0.15in, label={}]}
\newcommand{\cvEntriesEnd}{\end{itemize}\vspace{-6pt}}

% An entry heading: title, location, subtitle, period
\newcommand{\cvHeading}[4]{%
  \vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{@{}L{0.75\textwidth}@{\extracolsep{\fill}}r@{}}
    \textbf{#1} & \footnotesize #2 \\
    \textit{\small #3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-7pt}}

% A further role under the heading above: subtitle, period
\newcommand{\cvSubHeading}[2]{%
  \vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{@{}L{0.75\textwidth}@{\extracolsep{\fill}}r@{}}
    \textit{\small #1} & \textit{\small #2} \\
  \end{tabular*}\vspace{-7pt}}

% A position heading, a size smaller: title, location, role, period
\newcommand{\cvPositionHeading}[4]{%
  \vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{@{}L{0.75\textwidth}@{\extracolsep{\fill}}r@{}}
    \small\textbf{#1} & \footnotesize #2 \\
    \textit{\small #3} & \textit{\small #4} \\
  \end{tabular*}\vspace{-7pt}}

% Lines under a heading stay on its page: \nopagebreak here, and beginpenalty
% on the bullet lists, so a heading is never stranded at the foot of a page.

% A line under a heading, such as the relevant coursework
\newcommand{\cvNote}[1]{\par\nopagebreak\vspace{3pt}{\footnotesize #1\par}}

% The sentence that introduces an entry, before its bullets
\newcommand{\cvLead}[1]{\par\nopagebreak\vspace{1pt}{\small\hspace{4pt}-- #1\par}\vspace{-5pt}}

% Bullets under a heading
\newcommand{\cvBulletsStart}{\begin{itemize}[beginpenalty=10000]}
\newcommand{\cvBulletsEnd}{\end{itemize}\vspace{-5pt}}
\newcommand{\cvBullet}[1]{\item{\cvBulletSize #1\par}\vspace{-2pt}}

% A project heading. Its rows are written by the renderer from these:
% title lines across the width, then the stack and link beside the period.
\newcommand{\cvProject}[1]{%
  \vspace{-2pt}\item
  \begin{tabular*}{0.97\textwidth}[t]{@{}L{0.78\textwidth}@{\extracolsep{\fill}}r@{}}
    #1
  \end{tabular*}}
\newcommand{\cvProjectTitle}[1]{\multicolumn{2}{@{}L{0.97\textwidth}@{}}{\textbf{#1}} \\}
\newcommand{\cvProjectSubtitle}[1]{\multicolumn{2}{@{}L{0.97\textwidth}@{}}{\textbf{\small #1}} \\}
\newcommand{\cvProjectMeta}[2]{#1 & \textit{\footnotesize #2} \\}
\newcommand{\cvStack}[1]{\emph{\footnotesize #1}}
% The link is one box, so a long one moves to the next line whole
\newcommand{\cvLink}[1]{\quad\mbox{\footnotesize\textit{[#1]}}}
\newcommand{\cvContext}[1]{\par\nopagebreak{\scriptsize #1\par}}
\newcommand{\cvProjectBulletsStart}{\begin{itemize}[leftmargin=0.35in, itemsep=1pt, topsep=1pt, parsep=0pt, beginpenalty=10000, label=\tiny$\bullet$]\cvBulletSize}
\newcommand{\cvProjectBulletsEnd}{\end{itemize}\vspace{-1pt}}
\newcommand{\cvProjectBullet}[1]{\item #1}

% One-line projects, gathered under a heading of their own. The period sits
% at the right of the last line, on a line of its own if it has to (the
% TeXbook's \signed), never stranded at the left.
\newcommand{\cvCompactStart}[1]{\vspace{-2pt}\item\textbf{#1}\cvBulletsStart}
\newcommand{\cvCompactEnd}{\cvBulletsEnd}
\newcommand{\cvCompact}[2]{\item{\cvBulletSize #1\unskip\nobreak\hfill\penalty50\hskip1em\hbox{}\nobreak\hfill\mbox{\textit{\footnotesize #2}}\parfillskip=0pt\par}\vspace{-2pt}}

\newcommand{\cvSummary}[1]{#1\par\vspace{-2pt}}

\newcommand{\cvSkillsStart}{\begin{itemize}[leftmargin=0.15in, label={}]\small\item}
\newcommand{\cvSkillsEnd}{\end{itemize}\vspace{-6pt}}
\newcommand{\cvSkill}[2]{\textbf{#1}: #2}

\newcommand{\cvInterestsStart}{\vspace{-13pt}\begin{multicols}{2}\begin{itemize}\small\setlength\itemsep{-4pt}}
\newcommand{\cvInterestsEnd}{\end{itemize}\end{multicols}}
\newcommand{\cvInterest}[1]{\item #1}

%-------------------------------------------------------------------------------

\begin{document}

{{HEADER}}

{{BODY}}

\end{document}
`
