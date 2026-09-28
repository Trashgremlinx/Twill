<p align="center">
  <img src="twill-mark.png" alt="" width="120">
</p>

<h1 align="center">Twill</h1>

<p align="center">A Society of Fur toolkit for Wolvden</p>

---

Twill reads the [Wolvden](https://www.wolvden.com/) page you already have open, lets you expand
on details you would otherwise need a separate document for, and gives you space to grow your
pack in a lore rich environment.

Hover a gene and get expanded details on where it comes from, how it might look bred with another
marking, and whether they can be a combo. Add detail to a wolf that you simply cannot see at a
glance without a separate lore document. Breeding challenges and planning your pack become easier.

**Twill will never play the game for you. We leave that to you.**

**[Read the full write up, with pictures &rarr;](https://trashgremlinx.github.io/Twill/)**

## Install

Two steps.

1. Install [Tampermonkey](https://www.tampermonkey.net/), a free browser extension. Chrome and
   Edge also need **Developer mode** switched on, which is a toggle on their extensions page.
2. Click **[twill.user.js](https://trashgremlinx.github.io/Twill/twill.user.js)** and press
   **Install** when Tampermonkey asks.

Then open Wolvden. The Twill mark sits in the corner of every page. Click it, or press `Alt+K`.

Updates happen by themselves after that. Nothing you have saved is ever lost when it updates.

## What is in it

Fourteen tools, each of which can be switched off on its own.

| | |
|---|---|
| **Genetics** | Hover any gene for a card: what it is, where it comes from, what it pairs into, whether it is lethal. Built from 251 bases, 194 eye colours, 2,370 markings and 28 mutations |
| **Lore** | Your own fields on a wolf's page, in sections you name. Wolf-link fields cross reference both ways, so if one wolf is bonded to another, both pages say so |
| **Tray** | Pin two wolves, then pair them: what the pups could inherit slot by slot, plus shared ancestors and the inbreeding figure for a pairing you have not made yet |
| **Pedigree** | Keeps the family trees the pairing check needs |
| **Collection** | Notes the base, eyes and markings of your own wolves, counted against the full catalogue |
| **Den Manager** | A card above your caves: care, breeding, pups, roles, old age, trades. Every section folds on its own |
| **Wardrobe** | Custom decor as extra layers, plus looks you can save and wear again |
| **Item Lookup** | A magnifier on any item: 284 recipes, the catalogue, or the trading centre, already searched |
| **Shopping List** | Items you want tagged **buy**, items you would trade away tagged **in stock**, wherever they appear |
| **Store Front** | On Manage Your Trades: what to restock, and which trades have offers waiting |
| **Notepad** | A movable notepad on every page, `Alt+N`. Pictures by web address, and notes can be pinned to a wolf |
| **Achievements** | All eleven categories in one place |
| **Fishing colours** | An accessibility filter for red-blind and green-blind players. It does not point at the fish |
| **Hide users** | Collapses posts from players you would rather not read |

Plus **nine reference guides kept offline**: herbs, scouting, illnesses, prey, battle enemies,
befriending, roles, mutation pass rates and pair bonds. 28 herbs and 21 medicines, 18 illnesses,
61 prey, 146 enemies, every befriending move against every disposition, and what each role runs
on, joined up rather than sitting in separate tables.

And **eight themes** with a live editor, a post composer that catches the HTML Wolvden silently
strips, and a Backup screen for moving to another computer.

## What it will not do

- It **never loads a page for you**. No randomly opened tabs.
- It **never clicks, submits or fills a form for you**. No auto explore, no bump tools, no
  pre-chosen answers for battles or befriending.
- It **never refreshes** anything on a timer. You still bump your own trades, raffles and
  chatter posts.
- It **sends nothing anywhere**. No server, no account, no tracking, no analytics.

These are facts about the source rather than promises. There is no `fetch`, `XMLHttpRequest`,
`sendBeacon`, `WebSocket`, `setInterval`, `.submit()` or `location.href` anywhere in the file,
and the script runs with `@grant none`.

## Your data

Everything lives in your own browser's `localStorage`, under keys prefixed `denkit:`, and never
leaves your machine. Your notes, lore, records and settings are readable only by that browser.
Clearing site data removes all of it, so use **Backup** in the hub if you are moving computers.

The file is around 600KB because every fact it explains is bundled inside it: bases, eye colours,
markings, mutations, recipes, herbs, prey and battle enemies. That is what lets the guides work
without ever contacting anything.

## Thanks

**[The Grouse House Wiki](https://grousehouse.wiki/)** for the game facts, gathered by people who
did a great deal of careful work. Twill writes all of its content independently from facts
collected across the wiki, Wolvden and community discussion.

**Wolvden, by Lioden Ltd**, for the game, the art and the team behind it. This is an unofficial
fan tool and is not affiliated with or endorsed by them.

**The Society of Fur**, for thoughts, wishes and feedback throughout.

## Come say hello

- [Join us on Discord](https://discord.gg/ZQDz8ANTUR)
- [The guild on Wolvden](https://www.wolvden.com/g/society/991)

Bugs, ideas and requests are all welcome. By [Fallowe](https://www.wolvden.com/profile/145906).
