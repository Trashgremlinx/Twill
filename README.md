<p align="center">
  <a href="https://trashgremlinx.github.io/Twill/"><img src="banner.png" alt="Twill, toolkit by Fallowe #145906"></a>
</p>

---

> **Understand your wolves.** **Genetics** explains every gene on a [Wolvden](https://www.wolvden.com/)
> wolf's page: where it comes from, how rare it is, and what it could become when bred.
> **Collection** keeps count of what you own.
>
> **Plan your breeding.** Pin wolves in the **Tray** and pair them to see their pups' chances, then
> plan a whole line in **Breeding projects** with heats and a timeline. **Pair Lists** puts ready
> pairs first.
>
> **Keep your pack's story.** **Lore**, **Reminders** and the **Notepad** keep your words on each
> wolf's page, and **Den Manager** sorts your den by what needs you.
>
> **Stay in control.** Twill only reads the page you're on. It never clicks or sends anything, and
> never plays the game for you.

<h3 align="center"><a href="https://trashgremlinx.github.io/Twill/#install">Get Twill</a></h3>

<p align="center">
  <a href="https://trashgremlinx.github.io/Twill/">See it in action</a> &nbsp;·&nbsp;
  <a href="https://trashgremlinx.github.io/Twill/changelog_twill.html">What's changed: the Twill Field Guide</a>
</p>

## What's in it

<table>
  <tr><td colspan="2"><b>The hub</b><br>Opens on cards for what's going on: events, your Puppy quest, the next project step, Goals and more. You choose which.</td></tr>
  <tr>
    <td width="50%"><b>Genetics</b><br>A card for every gene, coloured by where it comes from, on wolf pages and in the Wardrobe.</td>
    <td width="50%"><b>Tray and Pairing</b><br>Pin wolves and pair them: inheritance by slot, personality odds, shared ancestors.</td>
  </tr>
  <tr>
    <td><b>Breeding projects</b><br>Goals, matchmaking, a heat counter and a six-week timeline.</td>
    <td><b>Pair Lists</b><br>Ready pairs first, a note on pairs in a project, your monthly breedings counted.</td>
  </tr>
  <tr>
    <td><b>Den Manager</b><br>Care, heats, pups, roles and old age, sorted above your caves.</td>
    <td><b>Lore and Reminders</b><br>Your own fields and notes, shown on each wolf's page.</td>
  </tr>
  <tr>
    <td><b>Compose a post</b><br>Shows what Wolvden will strip, and keeps snippets with blanks to fill in.</td>
    <td><b>Collection and Wardrobe</b><br>Tick what you own; layer and save decor looks.</td>
  </tr>
  <tr>
    <td><b>Notepad and Shopping List</b><br>Notes on every page; buy and in-stock tags with your prices.</td>
    <td><b>11 guides</b><br>Herbs, scouting, illnesses, prey, battle, fishing, events and more, offline.</td>
  </tr>
  <tr><td colspan="2"><b>Comfort and colour</b><br>36 themes, reading fonts, spacing, a reading ruler, and fishing colours for colour-blind players.</td></tr>
</table>

## What it will not do

> It **never clicks, submits or fills in** anything for you, and **never refreshes** a page.<br>
> It **sends nothing anywhere**: no server, no account, no tracking.<br>
> It **keeps only what you pick**: 8 wolves in the Tray, and 8 in each of up to 4 projects.

**Is this allowed?** We have received the green light from the Wolvden support team to publicly
share Twill with you.

It's free, everything stays in your own browser, and it updates itself. You'll need Tampermonkey,
a free browser extension; Get Twill walks you through it. Found a bug or have an idea? Let me know!
Community feedback helps this project flourish.

<h3 align="center"><a href="https://trashgremlinx.github.io/Twill/#install">Get Twill</a></h3>

<p align="center">
  <a href="https://discord.gg/ZQDz8ANTUR"><img src="sof-logo.png" alt="The Society of Fur" width="48"></a>
</p>

<p align="center"><sub>Facts from the <a href="https://grousehouse.wiki/">Grouse House Wiki</a>. An unofficial user script, not affiliated with Wolvden or Lioden Ltd. Use at your own risk.</sub></p>

---

<details>
<summary><b>Installing by hand</b></summary>

1. Install [Tampermonkey](https://www.tampermonkey.net/). On Chrome and Edge, open the extensions
   page, click **Details** on Tampermonkey and switch on **Allow User Scripts** (on older versions,
   turn on **Developer mode** instead).
2. Click **[twill.user.js](https://trashgremlinx.github.io/Twill/twill.user.js)** and press
   **Install** when Tampermonkey asks.

Then open Wolvden: the Twill mark sits in the corner of every page. Click it, or press `Alt+K`.
To update early, click the Tampermonkey icon and choose **Check for userscript updates**.

**Other scripts:** HoLMod: compatible with Twill.
</details>

<details>
<summary><b>Your data, and what's in the file</b></summary>

Everything lives in your own browser, under keys starting `denkit:`, and never leaves your machine.
Almost all of it is what you wrote yourself. The only things taken from Wolvden's pages are the
genes and family tree of each wolf you pick (forgotten when it leaves the Tray or a project),
Lillemor's puppy quest if you keep it, and this month's pair breedings count from Pair Lists. Use
**Backup** (behind the **?** in the hub) if you move computers.

There is no `fetch`, `XMLHttpRequest`, `sendBeacon`, `WebSocket`, `setInterval`, `.submit()` or
`location.href` anywhere in the file, and it runs with `@grant none`. It is just under 1MB because
every fact it explains is bundled inside it, so the guides never contact anything.
</details>

<details>
<summary><b>Thanks</b></summary>

**[The Grouse House Wiki](https://grousehouse.wiki/)** for the game facts, gathered by people who
did a great deal of careful work. Twill writes all of its content in its own words.

**Wolvden, by Lioden Ltd**, for the game, the art and the team behind it.

**The Society of Fur**, for thoughts, wishes and feedback throughout.
</details>

<details>
<summary><b>Licence</b></summary>

Twill is free to use and free to pass on, and it asks to be passed on whole. Share the link or the
file as much as you like, keep the credit where it is, and do not sell it or hand on a copy you have
edited. **[Read the licence](LICENCE.md)**
</details>
