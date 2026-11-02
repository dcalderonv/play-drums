(() => {
  'use strict';

  const BARS = 2;
  const $ = (s) => document.querySelector(s);

  /* Instruments, top of the staff to the bottom. pos counts half spaces up from the bottom line. */
  const INSTRUMENTS = [
    { id: 'crash', name: 'Crash', pos: 10, head: 'x', voice: 'hands' },
    { id: 'ride', name: 'Ride', pos: 8, head: 'x', voice: 'hands' },
    { id: 'openhat', name: 'Open hi-hat', pos: 9, head: 'x', open: true, voice: 'hands' },
    { id: 'hihat', name: 'Hi-hat', pos: 9, head: 'x', voice: 'hands' },
    { id: 'hightom', name: 'High tom', pos: 7, head: 'o', voice: 'hands' },
    { id: 'snare', name: 'Snare', pos: 5, head: 'o', voice: 'hands' },
    { id: 'crossstick', name: 'Cross-stick', pos: 5, head: 'c', voice: 'hands' },
    { id: 'floortom', name: 'Floor tom', pos: 3, head: 'o', voice: 'hands' },
    { id: 'kick', name: 'Kick', pos: 1, head: 'o', voice: 'feet' },
    { id: 'hatfoot', name: 'Hi-hat foot', pos: -1, head: 'x', voice: 'feet' },
  ];

  /* Time signatures. A beat splits into sub steps; 6/8 counts two dotted-quarter beats of three eighths. */
  const METERS = {
    '4/4': { beats: 4, top: 4, bottom: 4 },
    '3/4': { beats: 3, top: 3, bottom: 4 },
    '6/8': { beats: 2, top: 6, bottom: 8, compound: true },
  };
  /* Old saved grooves only stored a grid of 16 or 12 steps a bar, always in 4/4. */
  const shapeOf = (it) => {
    const meter = METERS[it.meter] ? it.meter : '4/4';
    const sub = METERS[meter].compound ? 3 : it.sub || (it.grid || 16) / 4;
    return { meter, sub, grid: METERS[meter].beats * sub };
  };
  const shapeName = (sh) => (METERS[sh.meter].compound ? sh.meter : `${sh.meter}, ${sh.sub === 3 ? 'triplets' : 'sixteenths'}`);

  /* A step holds 0 off, 1 a hit, 2 an accent, 3 a ghost note. */
  const ACCENT = 2;
  const GHOST = 3;
  const VELOCITY = [0, 0.62, 1, 0.24];
  const STRENGTH = [0, 2, 3, 1];

  /* Patterns are written as text: x a hit, X an accent, g a ghost note, - nothing. */
  const LEVEL_OF = { x: 1, X: ACCENT, g: GHOST };
  const parse = (s) => [...s.replace(/\s/g, '')].map((c) => LEVEL_OF[c] || 0);
  const twice = (s) => s + s;
  const empty = (grid) => new Array(grid * BARS).fill(0);
  const build = (parts, grid) => {
    const p = {};
    for (const i of INSTRUMENTS) p[i.id] = parts[i.id] ? parse(parts[i.id]) : empty(grid);
    return p;
  };
  /* Saved grooves from before an instrument existed get an empty row for it. */
  const normalize = (pattern, grid) => {
    const p = {};
    for (const i of INSTRUMENTS) {
      const row = pattern && pattern[i.id];
      p[i.id] = Array.isArray(row) && row.length === grid * BARS ? row.slice() : empty(grid);
    }
    return p;
  };

  /* ---------- The library ---------- */
  const EIGHTH_HATS = twice('x-x-x-x-x-x-x-x-');
  const BACKBEAT = twice('----x-------x---');
  const REST_BAR = '-'.repeat(16);

  // Swing is written on a triplet grid: three steps a beat, twelve a bar.
  const RIDE = 'x--X-xx--X-x';
  const FOOT = '---x-----x--';
  const SWUNG = 'x-xx-xx-xx-x';

  // The jazz waltz is the ride pattern folded into three: nine triplet steps a bar.
  const WALTZ_RIDE = 'x--x-xx--';
  const WALTZ_FOOT = '---x-----';
  // 6/8 is written in eighths, six a bar. The bell pattern runs across both bars.
  const BELL = 'x-x-xx' + '-x-x-x';

  const COLLECTIONS = [
    { id: 'foundations', tab: 'Rock', title: 'Rock and pop', levels: ['First strokes', 'Building blocks', 'Around the kit', 'Stretch'] },
    { id: 'swing', tab: 'Jazz', title: 'Swing, jazz and comping', levels: ['Time feel', 'First comping', 'Independence', 'Stretch'] },
    { id: 'threes', tab: '3/4 and 6/8', title: 'Grooves in 3/4 and 6/8', levels: ['Counting in three', 'Grooves in three', 'Jazz waltz', 'Afro-Cuban 6/8'] },
  ];

  /* Written easiest first: by collection and level, and within a level in the order to learn them. */
  const LIBRARY = [
    // Rock and pop, level 1
    { level: 1, kind: 'Rudiment', id: 'quarters', title: 'Quarter notes', goal: 100, start: 60, focus: 'One stroke per click, alternating hands. Let the stick bounce back up on its own.', sticking: twice('R---L---R---L---'), parts: { snare: twice('x---x---x---x---') } },
    { level: 1, kind: 'Rudiment', id: 'eighths', title: 'Eighth notes', goal: 110, start: 60, focus: 'Two strokes per click, hand to hand, the and as loud as the beat.', sticking: twice('R-L-R-L-R-L-R-L-'), parts: { snare: twice('x-x-x-x-x-x-x-x-') } },
    { level: 1, kind: 'Groove', id: 'quarter-groove', title: 'Quarter-note groove', goal: 100, start: 60, focus: 'Hi-hat on every beat, snare on 2 and 4, kick on 1 and 3. Every limb lands on a click.', parts: { hihat: twice('x---x---x---x---'), snare: BACKBEAT, kick: twice('x-------x-------') } },
    { level: 1, kind: 'Groove', id: 'basic-rock', title: 'Basic rock beat', goal: 100, start: 70, focus: 'Hi-hat on every eighth note, snare on 2 and 4, kick on 1 and 3.', parts: { hihat: EIGHTH_HATS, snare: BACKBEAT, kick: twice('x-------x-------') } },
    { level: 1, kind: 'Rudiment', id: 'singles', title: 'Single strokes', goal: 120, start: 70, focus: 'Even sixteenths, hand to hand, both sticks rising to the same height.', sticking: twice('RLRLRLRLRLRLRLRL'), parts: { snare: twice('XxxxXxxxXxxxXxxx') } },

    // Rock and pop, level 2
    { level: 2, kind: 'Rudiment', id: 'accented-eighths', title: 'Accented eighths', goal: 120, start: 70, focus: 'Hand to hand eighths with the accent on every beat; keep the notes between low.', sticking: twice('R-L-R-L-R-L-R-L-'), parts: { snare: twice('X-x-X-x-X-x-X-x-') } },
    { level: 2, kind: 'Rudiment', id: 'doubles', title: 'Double strokes', goal: 110, start: 60, focus: 'Two strokes per hand, the second as loud as the first.', sticking: twice('RRLLRRLLRRLLRRLL'), parts: { snare: twice('XxxxXxxxXxxxXxxx') } },
    { level: 2, kind: 'Groove', id: 'crash-one', title: 'Crash on one', goal: 100, start: 70, focus: 'The basic beat, opened by a crash and kick together on the first beat of the phrase.', parts: { crash: 'x' + '-'.repeat(31), hihat: '--x-x-x-x-x-x-x-' + 'x-x-x-x-x-x-x-x-', snare: BACKBEAT, kick: twice('x-------x-------') } },
    { level: 2, kind: 'Groove', id: 'kick-and', title: 'Kick on the and of 2', goal: 100, start: 65, focus: 'Keep the hands from the basic beat and add a kick just after the snare on 2.', parts: { hihat: EIGHTH_HATS, snare: BACKBEAT, kick: twice('x-----x-x-------') } },
    { level: 2, kind: 'Groove', id: 'ride-groove', title: 'Ride groove', goal: 110, start: 70, focus: 'Move the right hand to the ride: eighths on the cymbal, accent on every beat.', parts: { ride: twice('X-x-X-x-X-x-X-x-'), snare: BACKBEAT, kick: twice('x-------x-x-----') } },
    { level: 2, kind: 'Groove', id: 'half-time', title: 'Half-time groove', goal: 90, start: 70, focus: 'One snare a bar, on 3. Let the space feel slow while the hat keeps time.', parts: { hihat: EIGHTH_HATS, snare: twice('--------X-------'), kick: twice('x-----x---------') } },
    { level: 2, kind: 'Rudiment', id: 'paradiddle', title: 'Single paradiddle', goal: 100, start: 60, focus: 'Accent the first note of each group; the accent swaps hands every beat.', sticking: twice('RLRRLRLLRLRRLRLL'), parts: { snare: twice('XxxxXxxxXxxxXxxx') } },

    // Rock and pop, level 3
    { level: 3, kind: 'Groove', id: 'open-hat-four', title: 'Open hi-hat on the and of 4', goal: 100, start: 70, focus: 'The basic beat, with the hat opening on the last eighth and closing again on 1.', parts: { hihat: twice('x-x-x-x-x-x-x---'), openhat: twice('--------------x-'), snare: BACKBEAT, kick: twice('x-------x-------') } },
    { level: 3, kind: 'Fill', id: 'snare-fill', title: 'One-beat snare fill', goal: 100, start: 70, focus: 'Three beats of groove, four sixteenths on the snare, then the crash on 1.', sticking: '-'.repeat(28) + 'RLRL', parts: { crash: 'x' + '-'.repeat(31), hihat: '--x-x-x-x-x-x-x-' + 'x-x-x-x-x-x-----', snare: '----x-------x---' + '----x-------xxxx', kick: twice('x-------x-------') } },
    { level: 3, kind: 'Groove', id: 'sixteenth-hats', title: 'Sixteenth-note hi-hat', goal: 90, start: 60, focus: 'Hat hand to hand; on 2 and 4 the right hand leaves the hat for the snare.', sticking: twice('RLRLRLRLRLRLRLRL'), parts: { hihat: twice('xxxx-xxxxxxx-xxx'), snare: BACKBEAT, kick: twice('x-------x-x-----') } },
    { level: 3, kind: 'Groove', id: 'four-floor', title: 'Four on the floor', goal: 120, start: 90, focus: 'Kick on every beat; the hi-hat closes on the beat and opens on every and.', parts: { hihat: twice('x---x---x---x---'), openhat: twice('--x---x---x---x-'), snare: BACKBEAT, kick: twice('x---x---x---x---') } },
    { level: 3, kind: 'Groove', id: 'syncopated-kick', title: 'Syncopated kick', goal: 100, start: 60, focus: 'The kick lands on the a of 2 and the and of 3; count the sixteenths out loud.', parts: { hihat: EIGHTH_HATS, snare: BACKBEAT, kick: twice('x------x--x-----') } },
    { level: 3, kind: 'Groove', id: 'paradiddle-kit', title: 'Paradiddle on the kit', goal: 100, start: 60, focus: 'Right hand on the hat, left on the snare, sticking RLRR LRLL; accent the snare on 2 and 4.', sticking: twice('RLRRLRLLRLRRLRLL'), parts: { hihat: twice('x-xx-x--x-xx-x--'), snare: twice('-x--X-xx-x--X-xx'), kick: twice('x-------x-------') } },
    { level: 3, kind: 'Fill', id: 'tom-fill', title: 'Two-beat fill around the toms', goal: 90, start: 60, focus: 'Four on the snare, two on the high tom, two on the floor tom.', sticking: '-'.repeat(24) + 'RLRLRLRL', parts: { crash: 'x' + '-'.repeat(31), hihat: '--x-x-x-x-x-x-x-' + 'x-x-x-x---------', snare: '----x-------x---' + '----x---xxxx----', hightom: REST_BAR + '------------xx--', floortom: REST_BAR + '--------------xx', kick: 'x-------x-------' + 'x---------------' } },

    // Rock and pop, level 4
    { level: 4, kind: 'Groove', id: 'kick-doubles', title: 'Kick doubles', goal: 100, start: 60, focus: 'Two kicks a sixteenth apart, on the a of 2 and on 3. Keep the heel steady.', parts: { hihat: EIGHTH_HATS, snare: BACKBEAT, kick: twice('x------xx-------') } },
    { level: 4, kind: 'Groove', id: 'linear', title: 'Linear groove', goal: 90, start: 55, focus: 'No two limbs ever land together: kick, hat and snare take turns on every sixteenth.', parts: { hihat: twice('-xx--x-xx-x--xxx'), snare: BACKBEAT, kick: twice('x--x--x--x-x----') } },
    { level: 4, kind: 'Fill', id: 'bar-fill', title: 'Full-bar fill around the kit', goal: 90, start: 55, focus: 'A bar of groove, then sixteen notes from the snare down to the floor tom and back to the crash.', sticking: REST_BAR + 'RLRLRLRLRLRLRLRL', parts: { crash: 'x' + '-'.repeat(31), hihat: '--x-x-x-x-x-x-x-' + REST_BAR, snare: '----x-------x---' + 'xxxxxx----------', hightom: REST_BAR + '------xxxx------', floortom: REST_BAR + '----------xxxxxx', kick: 'x-------x-------' + 'x---x---x---x---' } },

    // Swing and jazz, level 1: the time
    { collection: 'swing', sub: 3, level: 1, kind: 'Rudiment', id: 'swung-eighths', title: 'Swung eighths', goal: 180, start: 100, focus: 'Long, short, long, short: play the first and last note of each triplet and leave the middle silent.', sticking: twice('R-LR-LR-LR-L'), parts: { snare: twice(SWUNG) } },
    { collection: 'swing', sub: 3, level: 1, kind: 'Rudiment', id: 'triplets', title: 'Eighth-note triplets', goal: 160, start: 80, focus: 'Three even notes per click, hand to hand. The accent changes hands every beat.', sticking: twice('RLRLRLRLRLRL'), parts: { snare: twice('XxxXxxXxxXxx') } },
    { collection: 'swing', sub: 3, level: 1, kind: 'Groove', id: 'quarter-ride', title: 'Quarter notes on the ride', goal: 200, start: 100, focus: 'The pulse of swing: an even quarter note on the ride, the hi-hat foot closing on 2 and 4.', parts: { ride: twice('x--x--x--x--'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 1, kind: 'Groove', id: 'swing-ride', title: 'Swing ride pattern', goal: 200, start: 100, focus: 'Ding, ding-a, ding, ding-a. The skip note is the last of the triplet, and 2 and 4 lean forward.', parts: { ride: twice(RIDE), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 1, kind: 'Groove', id: 'feathered-kick', title: 'Feathering the kick', goal: 180, start: 100, focus: 'Add the kick on all four beats, so soft it is felt more than heard.', parts: { ride: twice(RIDE), kick: twice('g--g--g--g--'), hatfoot: twice(FOOT) } },

    // Swing and jazz, level 2: first comping figures over the ride and foot
    { collection: 'swing', sub: 3, level: 2, kind: 'Comping', id: 'comp-four', title: 'Comping on beat 4', goal: 180, start: 100, focus: 'Keep the ride and foot going and drop one snare note on beat 4 of every bar.', parts: { ride: twice(RIDE), snare: twice('---------x--'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 2, kind: 'Comping', id: 'comp-push', title: 'The push on the and of 4', goal: 180, start: 100, focus: 'One accented snare on the skip note before 1, the push that pulls the band into the next bar.', parts: { ride: twice(RIDE), snare: twice('-----------X'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 2, kind: 'Comping', id: 'charleston', title: 'Charleston', goal: 180, start: 90, focus: 'Snare on 1 and on the skip note of 2, under a ride that never changes.', parts: { ride: twice(RIDE), snare: twice('x----x------'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 2, kind: 'Comping', id: 'comp-skips', title: 'Comping on every skip note', goal: 170, start: 90, focus: 'The snare joins the last note of every triplet, so the hands swing together.', parts: { ride: twice(RIDE), snare: twice('--x--x--x--x'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 2, kind: 'Groove', id: 'shuffle', title: 'Shuffle', goal: 140, start: 80, focus: 'Swung eighths on the hat, backbeat on 2 and 4, kick on 1 and 3: the blues shuffle.', parts: { hihat: twice(SWUNG), snare: twice('---X-----X--'), kick: twice('x-----x-----') } },
    { collection: 'swing', sub: 3, level: 2, kind: 'Groove', id: 'two-feel', title: 'Two-feel', goal: 180, start: 100, focus: 'The bass plays half notes and so does the kick: soft on 1 and 3 under the ride.', parts: { ride: twice(RIDE), kick: twice('g-----g-----'), hatfoot: twice(FOOT) } },

    // Swing and jazz, level 3: independence
    { collection: 'swing', sub: 3, level: 3, kind: 'Comping', id: 'reverse-charleston', title: 'Reverse Charleston', goal: 180, start: 90, focus: 'The Charleston turned around: snare on the skip note of 1 and on beat 3.', parts: { ride: twice(RIDE), snare: twice('--x---x-----'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 3, kind: 'Comping', id: 'middle-triplet', title: 'Comping on the middle triplet', goal: 160, start: 80, focus: 'The one note the ride never plays: the middle of each triplet. Count one, trip, let out loud.', parts: { ride: twice(RIDE), snare: twice('-x--x--x--x-'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 3, kind: 'Comping', id: 'kick-comping', title: 'Comping with the kick', goal: 170, start: 90, focus: 'Move the comping to the bass drum: the skip notes of 2 and 4, short and light.', parts: { ride: twice(RIDE), kick: twice('-----x-----x'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 3, kind: 'Comping', id: 'snare-kick-phrase', title: 'Snare and kick in conversation', goal: 170, start: 90, focus: 'A two-bar phrase shared by snare and kick while the ride and foot never change.', parts: { ride: twice(RIDE), snare: '--x-----x---' + '-----x------', kick: '-----x------' + '--x--------x', hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 3, kind: 'Groove', id: 'half-time-shuffle', title: 'Half-time shuffle', goal: 90, start: 60, focus: 'Ghost notes on the middle triplet fill the gaps; one strong backbeat on 3 each bar.', parts: { hihat: twice(SWUNG), snare: twice('-g--g-X---g-'), kick: twice('x--------x-x') } },
    { collection: 'swing', level: 3, kind: 'Groove', id: 'bossa-nova', title: 'Bossa nova', goal: 140, start: 80, focus: 'Straight eighths, not swung: ride eighths, a cross-stick figure across two bars, kick on 1 and 3 with a pickup before each.', parts: { ride: EIGHTH_HATS, crossstick: 'x-----x-----x---' + '----x-----x-----', kick: twice('x-----x-x-----x-'), hatfoot: BACKBEAT } },

    // Swing and jazz, level 4
    { collection: 'swing', sub: 3, level: 4, kind: 'Comping', id: 'ghosted-push', title: 'Ghosted triplets and the push', goal: 170, start: 80, focus: 'Ghost the middle of each triplet with the left hand, then accent the push on the and of 4.', parts: { ride: twice(RIDE), snare: twice('-g--g--g--gX'), hatfoot: twice(FOOT) } },
    { collection: 'swing', sub: 3, level: 4, kind: 'Fill', id: 'triplet-fill', title: 'Triplet fill around the toms', goal: 160, start: 80, focus: 'Two beats of time, then two beats of triplets from the snare to the floor tom, landing on a crash.', sticking: '-'.repeat(18) + 'RLRLRL', parts: { crash: 'x' + '-'.repeat(23), ride: '---X-xx--X-x' + 'x--X-x------', snare: '-'.repeat(12) + '------xxx---', hightom: '-'.repeat(12) + '---------xx-', floortom: '-'.repeat(12) + '-----------x', kick: 'x' + '-'.repeat(23), hatfoot: twice(FOOT) } },
    { collection: 'swing', level: 4, kind: 'Groove', id: 'samba', title: 'Samba', goal: 120, start: 70, focus: 'Sixteenths on the snare, accented on the last of each beat, over a kick that pulses long, short.', sticking: twice('RLRLRLRLRLRLRLRL'), parts: { snare: twice('gggXgggXgggXgggX'), kick: twice('x--xx--xx--xx--x'), hatfoot: twice('--x---x---x---x-') } },
    { collection: 'swing', sub: 3, level: 4, kind: 'Groove', id: 'up-tempo', title: 'Up-tempo ride', goal: 260, start: 160, focus: 'The swing pattern at speed. Loosen the grip and let the skip note get lighter as the tempo climbs.', parts: { ride: twice(RIDE), hatfoot: twice(FOOT) } },

    // 3/4 and 6/8, level 1: counting in three. In 6/8 the tempo counts dotted quarters, two a bar.
    { collection: 'threes', meter: '3/4', level: 1, kind: 'Rudiment', id: 'waltz-quarters', title: 'Quarter notes in 3/4', goal: 120, start: 70, focus: 'Three strokes a bar, hand to hand, the accent on 1. Three is odd, so the accent changes hands every bar.', sticking: 'R---L---R---' + 'L---R---L---', parts: { snare: twice('X---x---x---') } },
    { collection: 'threes', meter: '3/4', level: 1, kind: 'Groove', id: 'oom-pah-pah', title: 'Oom-pah-pah', goal: 140, start: 80, focus: 'The waltz: kick on 1, snare on 2 and 3, the hi-hat on every beat above them.', parts: { hihat: twice('x---x---x---'), snare: twice('----x---x---'), kick: twice('x-----------') } },
    { collection: 'threes', meter: '6/8', level: 1, kind: 'Rudiment', id: 'six-eight-eighths', title: 'Eighth notes in 6/8', goal: 100, start: 50, focus: 'Six eighths a bar in two groups of three, accents on 1 and 4. Each click is one group, a dotted quarter.', sticking: twice('RLRLRL'), parts: { snare: twice('XxxXxx') } },
    { collection: 'threes', meter: '6/8', level: 1, kind: 'Groove', id: 'six-eight-ballad', title: '6/8 ballad', goal: 70, start: 40, focus: 'Hi-hat on every eighth, kick on 1, snare on 4. Slow and wide; count all six out loud.', parts: { hihat: twice('xxxxxx'), snare: twice('---x--'), kick: twice('x-----') } },

    // 3/4 and 6/8, level 2: grooves in three
    { collection: 'threes', meter: '3/4', level: 2, kind: 'Groove', id: 'waltz-rock', title: 'Rock beat in 3/4', goal: 120, start: 70, focus: 'Eighths on the hi-hat, kick on 1 and the and of 2, snare on 3.', parts: { hihat: twice('x-x-x-x-x-x-'), snare: twice('--------x---'), kick: twice('x-----x-----') } },
    { collection: 'threes', meter: '3/4', level: 2, kind: 'Fill', id: 'waltz-fill', title: 'Fill in 3/4', goal: 110, start: 60, focus: 'A bar of the 3/4 rock beat, then twelve sixteenths: four each on the snare, high tom and floor tom.', sticking: '-'.repeat(12) + 'RLRLRLRLRLRL', parts: { crash: 'x' + '-'.repeat(23), hihat: '--x-x-x-x-x-' + '-'.repeat(12), snare: '--------x---' + 'xxxx--------', hightom: '-'.repeat(12) + '----xxxx----', floortom: '-'.repeat(12) + '--------xxxx', kick: 'x-----x-----' + 'x-----------' } },
    { collection: 'threes', meter: '6/8', level: 2, kind: 'Groove', id: 'six-eight-kick', title: '6/8 with a moving kick', goal: 80, start: 45, focus: 'The ballad, with the kick on 1, 3 and 6 leaning into the next group.', parts: { hihat: twice('xxxxxx'), snare: twice('---x--'), kick: twice('x-x--x') } },
    { collection: 'threes', meter: '6/8', level: 2, kind: 'Fill', id: 'six-eight-fill', title: '6/8 fill around the toms', goal: 80, start: 45, focus: 'A bar of the ballad, then two eighths each on the snare, high tom and floor tom, landing on the crash.', sticking: '------' + 'RLRLRL', parts: { crash: 'x' + '-'.repeat(11), hihat: '-xxxxx' + '------', snare: '---x--' + 'xx----', hightom: '------' + '--xx--', floortom: '------' + '----xx', kick: 'x-----' + 'x-----' } },

    // 3/4 and 6/8, level 3: the jazz waltz, on a triplet grid
    { collection: 'threes', meter: '3/4', sub: 3, level: 3, kind: 'Groove', id: 'jazz-waltz-ride', title: 'Jazz waltz ride', goal: 180, start: 100, focus: 'Ding, ding-a, ding: the swing ride folded into 3/4, with the hi-hat foot closing on 2.', parts: { ride: twice(WALTZ_RIDE), hatfoot: twice(WALTZ_FOOT) } },
    { collection: 'threes', meter: '3/4', sub: 3, level: 3, kind: 'Groove', id: 'jazz-waltz-feather', title: 'Feathered kick in 3/4', goal: 170, start: 100, focus: 'A soft kick on every beat under the ride, felt more than heard.', parts: { ride: twice(WALTZ_RIDE), kick: twice('g--g--g--'), hatfoot: twice(WALTZ_FOOT) } },
    { collection: 'threes', meter: '3/4', sub: 3, level: 3, kind: 'Comping', id: 'jazz-waltz-push', title: 'Waltz comping on the let of 3', goal: 170, start: 90, focus: 'One snare note on the last triplet of the bar, pushing the band into 1.', parts: { ride: twice(WALTZ_RIDE), snare: twice('--------x'), hatfoot: twice(WALTZ_FOOT) } },
    { collection: 'threes', meter: '3/4', sub: 3, level: 3, kind: 'Comping', id: 'jazz-waltz-phrase', title: 'Two-bar waltz phrase', goal: 160, start: 90, focus: 'Snare and kick share a phrase between the skip notes while the ride and foot keep counting three.', parts: { ride: twice(WALTZ_RIDE), snare: '-----x---' + '--x------', kick: '---------' + '--------x', hatfoot: twice(WALTZ_FOOT) } },

    // 3/4 and 6/8, level 4: Afro-Cuban 6/8
    { collection: 'threes', meter: '6/8', level: 4, kind: 'Groove', id: 'six-eight-bell', title: 'The 6/8 bell', goal: 110, start: 50, focus: 'The Afro-Cuban bell on the ride, seven strokes across two bars, over a kick on every dotted quarter.', parts: { ride: BELL, kick: twice('x--x--') } },
    { collection: 'threes', meter: '6/8', level: 4, kind: 'Groove', id: 'afro-cuban', title: 'Afro-Cuban 6/8', goal: 110, start: 50, focus: 'Bell on the ride, kick on 1, cross-stick and hi-hat foot together on 4, answering the bell.', parts: { ride: BELL, crossstick: twice('---x--'), kick: twice('x-----'), hatfoot: twice('---x--') } },
    { collection: 'threes', meter: '6/8', level: 4, kind: 'Groove', id: 'afro-cuban-toms', title: 'Afro-Cuban 6/8 with the toms', goal: 100, start: 50, focus: 'Keep the bell and the feet, and let the left hand travel: cross-stick on 4, high tom on 6, floor tom to close the phrase.', parts: { ride: BELL, crossstick: twice('---x--'), hightom: '-----x' + '------', floortom: '------' + '----xx', kick: twice('x-----'), hatfoot: twice('---x--') } },
  ];

  const GROUPS = COLLECTIONS.map((c) => ({
    ...c,
    units: c.levels.map((name, n) => ({
      title: `Level ${n + 1}, ${name.toLowerCase()}`,
      items: LIBRARY.filter((ex) => (ex.collection || 'foundations') === c.id && ex.level === n + 1),
    })),
  }));

  const EXERCISES = new Map();
  for (const c of GROUPS) {
    for (const u of c.units) {
      for (const ex of u.items) {
        const shape = shapeOf(ex);
        EXERCISES.set(ex.id, { ...ex, ...shape, collection: c.id, collectionTitle: c.title, unit: u.title, pattern: build(ex.parts, shape.grid) });
      }
    }
  }

  /* Local storage, failing quietly when the browser refuses it */
  const store = {
    get(k, d) { try { const v = localStorage.getItem('play-drums:' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem('play-drums:' + k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const bests = store.get('bests', {});
  const grooves = store.get('grooves', []);
  const practice = store.get('practice', {});
  const todayKey = new Date().toISOString().slice(0, 10);

  /* Groove names can come from an imported file, so they are escaped before they go into markup. */
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
  const clone = (p) => Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v.slice()]));
  const samePattern = (a, b) => INSTRUMENTS.every((i) => a[i.id].length === b[i.id].length && a[i.id].every((v, s) => v === b[i.id][s]));
  const dateFmt = new Intl.DateTimeFormat(undefined, { day: 'numeric', month: 'short' });

  const state = {
    kind: 'exercise',
    item: EXERCISES.get('basic-rock'),
    view: 'foundations',
    meter: '4/4',
    sub: 4,
    grid: 16,
    pattern: null,
    sticking: null,
    bpm: 80,
    playing: false,
    opts: { click: true, countIn: true, groove: true },
  };
  const meter = () => METERS[state.meter];
  const beats = () => meter().beats;
  const sub = () => state.sub;
  const total = () => state.grid * BARS;
  const setShape = (sh) => { state.meter = sh.meter; state.sub = sh.sub; state.grid = sh.grid; };

  /* ---------- Audio ---------- */
  let ctx = null;
  let master = null;
  let noiseBuffer = null;

  function ensureAudio() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try { ctx = new AC(); } catch { return null; }
      master = ctx.createGain();
      master.gain.value = 0.8;
      master.connect(ctx.destination);
      noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noiseBuffer.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function noise(t, dur, type, freq, gain, q = 0.7) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer;
    const f = ctx.createBiquadFilter();
    f.type = type; f.frequency.value = freq; f.Q.value = q;
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  function tone(t, f0, f1, dur, gain, type = 'sine') {
    const o = ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(f0, t);
    o.frequency.exponentialRampToValueAtTime(f1, t + dur * 0.6);
    const g = ctx.createGain();
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g).connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  const VOICES = {
    kick: (t, v) => tone(t, 150, 45, 0.45, 1.0 * v),
    snare: (t, v) => { noise(t, 0.18, 'highpass', 1400, 0.6 * v); tone(t, 220, 160, 0.12, 0.35 * v, 'triangle'); },
    crossstick: (t, v) => { tone(t, 1750, 1600, 0.035, 0.22 * v, 'square'); noise(t, 0.03, 'bandpass', 2600, 0.3 * v, 2); },
    hihat: (t, v) => noise(t, 0.05, 'highpass', 7500, 0.32 * v),
    openhat: (t, v) => noise(t, 0.38, 'highpass', 7000, 0.26 * v),
    hatfoot: (t, v) => { noise(t, 0.045, 'bandpass', 3800, 0.42 * v, 1.4); tone(t, 260, 180, 0.03, 0.08 * v); },
    ride: (t, v) => { noise(t, 0.7, 'bandpass', 6200, 0.22 * v, 0.9); tone(t, 3100, 2950, 0.6, 0.035 * v); },
    crash: (t, v) => noise(t, 1.4, 'highpass', 3600, 0.42 * v),
    hightom: (t, v) => tone(t, 240, 170, 0.35, 0.7 * v),
    floortom: (t, v) => tone(t, 130, 85, 0.5, 0.8 * v),
  };
  /* Click levels: 2 the bar, 1 a beat, 0 an eighth inside a 6/8 beat. */
  const CLICK = [[980, 950, 0.1], [1250, 1200, 0.2], [1900, 1850, 0.32]];
  const click = (t, level) => { const [f0, f1, g] = CLICK[level]; tone(t, f0, f1, 0.04, g, 'square'); };

  /* ---------- Scheduler (look-ahead on the audio clock) ---------- */
  const LOOKAHEAD = 0.12;
  let timer = null;
  let nextStep = 0;
  let nextTime = 0;
  let queue = [];
  let shown = null;
  let raf = 0;
  let lastFrame = 0;
  let practisedSinceSave = 0;

  const stepDur = () => 60 / state.bpm / sub();

  function scheduleStep(step, t) {
    if (state.opts.click) {
      if (step % sub() === 0) click(t, step % state.grid === 0 ? 2 : 1);
      else if (meter().compound) click(t, 0);
    }
    if (state.opts.groove) {
      for (const i of INSTRUMENTS) {
        const v = state.pattern[i.id][step];
        if (v) VOICES[i.id](t, VELOCITY[v]);
      }
    }
  }

  function pump() {
    while (nextTime < ctx.currentTime + LOOKAHEAD) {
      const dur = stepDur();
      scheduleStep(nextStep, nextTime);
      queue.push({ step: nextStep, time: nextTime, dur });
      nextTime += dur;
      nextStep = (nextStep + 1) % total();
    }
  }

  function start() {
    if (!ensureAudio()) {
      setStatus('This browser cannot play sound, so the groove will not be heard. The score and the beat box still work; Chrome, Firefox and Safari all play it.', true);
      return;
    }
    setStatus('');
    state.playing = true;
    queue = [];
    shown = null;
    nextStep = 0;
    let t = ctx.currentTime + 0.08;
    if (state.opts.countIn) {
      // One bar of count-in: the beats, or in 6/8 all six eighths.
      const per = meter().compound ? sub() : 1;
      const count = beats() * per;
      const gap = 60 / state.bpm / per;
      for (let n = 0; n < count; n++) {
        click(t + n * gap, n === 0 ? 2 : n % per === 0 ? 1 : 0);
        queue.push({ count: n + 1, time: t + n * gap, dur: gap });
      }
      t += count * gap;
    }
    nextTime = t;
    pump();
    timer = setInterval(pump, 25);
    lastFrame = performance.now();
    raf = requestAnimationFrame(frame);
    renderPlayButton();
  }

  function stop() {
    state.playing = false;
    clearInterval(timer);
    cancelAnimationFrame(raf);
    queue = [];
    shown = null;
    playhead.classList.remove('is-on');
    setNow(-1);
    positionEl.textContent = 'Bar 1, beat 1';
    savePractice();
    renderPlayButton();
  }

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  let nowStep = -1;

  function frame(ts) {
    const now = ctx.currentTime;
    while (queue.length && queue[0].time <= now) shown = queue.shift();
    if (shown) {
      if (shown.count) {
        positionEl.textContent = 'Count-in ' + shown.count;
      } else if (shown.step < total()) {
        const frac = reduceMotion.matches ? 0 : Math.min(1, (now - shown.time) / shown.dur);
        movePlayhead(shown.step, frac);
        setNow(shown.step);
        const bar = Math.floor(shown.step / state.grid) + 1;
        const beat = Math.floor((shown.step % state.grid) / sub()) + 1;
        positionEl.textContent = 'Bar ' + bar + ', beat ' + beat;
        practisedSinceSave += (ts - lastFrame) / 1000;
        if (practisedSinceSave > 5) savePractice();
        else renderToday();
      }
    }
    lastFrame = ts;
    raf = requestAnimationFrame(frame);
  }

  function savePractice() {
    if (practisedSinceSave <= 0) return;
    practice[todayKey] = (practice[todayKey] || 0) + practisedSinceSave;
    practisedSinceSave = 0;
    store.set('practice', practice);
    renderToday();
  }

  /* ---------- DOM refs ---------- */
  const svg = $('#score');
  const lanes = $('#lanes');
  const seq = $('#seq');
  const playhead = $('#playhead');
  const positionEl = $('#position');
  const bpmInput = $('#bpm');
  const bpmOut = $('#bpm-out');
  const statusEl = $('#audio-status');
  const pads = {};
  let builtShape = '';
  let centers = [];
  let svgOffset = 0;

  function setStatus(msg, isError) {
    statusEl.textContent = msg;
    statusEl.classList.toggle('is-error', !!isError);
  }

  /* ---------- Beat box ---------- */
  const COUNTS = { 4: ['', 'e', '+', 'a'], 3: ['', 'trip', 'let'] };
  /* 6/8 counts every eighth, 1 to 6; simple time counts the beat and its subdivisions. */
  const countLabel = (q, i) => (meter().compound ? String(q * sub() + i + 1) : i === 0 ? String(q + 1) : COUNTS[sub()][i]);
  const shapeKey = () => state.meter + ':' + state.sub;

  function buildSeq() {
    setNow(-1);
    builtShape = shapeKey();
    const n = sub();
    const nb = beats();
    seq.style.setProperty('--sub', n);
    seq.style.setProperty('--beats', nb);
    seq.setAttribute('aria-label', `Beat box pads, two bars of ${state.meter} in ${meter().compound ? 'eighth notes' : n === 3 ? 'triplets' : 'sixteenth notes'}`);
    seq.textContent = '';
    const countRow = document.createElement('div');
    countRow.className = 'seq__row seq__row--count';
    countRow.setAttribute('aria-hidden', 'true');
    countRow.append(document.createElement('span'));
    for (let b = 0; b < BARS; b++) {
      const bar = document.createElement('div');
      bar.className = 'seq__bar';
      for (let q = 0; q < nb; q++) {
        const beat = document.createElement('div');
        beat.className = 'seq__beat';
        for (let i = 0; i < n; i++) {
          const s = document.createElement('span');
          s.textContent = countLabel(q, i);
          if (i === 0) s.className = 'is-beat';
          beat.append(s);
        }
        bar.append(beat);
      }
      countRow.append(bar);
    }
    seq.append(countRow);

    INSTRUMENTS.forEach((inst, r) => {
      const row = document.createElement('div');
      row.className = 'seq__row';
      row.setAttribute('role', 'group');
      row.setAttribute('aria-label', inst.name);
      const label = document.createElement('span');
      label.className = 'seq__label';
      label.textContent = inst.name;
      row.append(label);
      pads[inst.id] = [];
      for (let b = 0; b < BARS; b++) {
        const bar = document.createElement('div');
        bar.className = 'seq__bar';
        for (let q = 0; q < nb; q++) {
          const beat = document.createElement('div');
          beat.className = 'seq__beat';
          for (let i = 0; i < n; i++) {
            const step = b * state.grid + q * n + i;
            const pad = document.createElement('button');
            pad.type = 'button';
            pad.className = 'pad';
            pad.dataset.inst = inst.id;
            pad.dataset.step = step;
            pad.dataset.row = r;
            pad.tabIndex = r === 0 && step === 0 ? 0 : -1;
            beat.append(pad);
            pads[inst.id].push(pad);
          }
          bar.append(beat);
        }
        row.append(bar);
      }
      seq.append(row);
    });
  }

  const countName = (step) => {
    const n = sub();
    const i = step % n;
    const beat = Math.floor((step % state.grid) / n) + 1;
    if (meter().compound) return String((step % state.grid) + 1);
    if (i === 0) return String(beat);
    if (n === 3) return beat + (i === 1 ? ' trip' : ' let');
    return beat + (i === 1 ? ' e' : i === 2 ? ' and' : ' a');
  };
  const LEVEL_NAME = ['', '', ', accented', ', ghost note'];

  function renderPads() {
    for (const inst of INSTRUMENTS) {
      pads[inst.id].forEach((pad, s) => {
        const v = state.pattern[inst.id][s];
        pad.setAttribute('aria-pressed', v ? 'true' : 'false');
        if (v > 1) pad.dataset.level = String(v); else delete pad.dataset.level;
        pad.setAttribute('aria-label', `${inst.name}, bar ${Math.floor(s / state.grid) + 1}, count ${countName(s)}${LEVEL_NAME[v]}`);
      });
    }
  }

  seq.addEventListener('click', (e) => {
    const pad = e.target.closest('.pad');
    if (!pad) return;
    const { inst, step } = pad.dataset;
    const row = state.pattern[inst];
    row[step] = (row[step] + 1) % 4;
    if (row[step] && !state.playing && ensureAudio()) VOICES[inst](ctx.currentTime + 0.01, VELOCITY[row[step]]);
    onPatternChange();
  });

  seq.addEventListener('keydown', (e) => {
    const pad = e.target.closest('.pad');
    if (!pad) return;
    const moves = { ArrowRight: [0, 1], ArrowLeft: [0, -1], ArrowDown: [1, 0], ArrowUp: [-1, 0], Home: [0, -total()], End: [0, total()] };
    const m = moves[e.key];
    if (!m) return;
    e.preventDefault();
    const r = Math.max(0, Math.min(INSTRUMENTS.length - 1, +pad.dataset.row + m[0]));
    const s = Math.max(0, Math.min(total() - 1, +pad.dataset.step + m[1]));
    const next = pads[INSTRUMENTS[r].id][s];
    pad.tabIndex = -1;
    next.tabIndex = 0;
    next.focus();
  });

  /* Moves every hit into a new time signature or grid; place(step) gives its new step, or -1 to drop it.
     Two hits landing on one step keep the stronger. */
  function reshape(to, place) {
    const p = {};
    for (const i of INSTRUMENTS) {
      const row = empty(to.grid);
      state.pattern[i.id].forEach((v, s) => {
        const t = v ? place(s) : -1;
        if (t >= 0 && STRENGTH[v] > STRENGTH[row[t]]) row[t] = v;
      });
      p[i.id] = row;
    }
    if (state.playing) {
      nextStep = Math.round((nextStep * to.grid) / state.grid) % (to.grid * BARS);
      queue = queue.filter((q) => q.count);
      shown = null;
    }
    setShape(to);
    state.pattern = p;
    state.sticking = null;
    onPatternChange();
  }

  /* Switching the grid moves each hit to the nearest step of the new grid: straight to swung and back. */
  const TO_TRIPLETS = [0, 1, 2, 2];
  const TO_SIXTEENTHS = [0, 1, 2];

  function setFeel(to) {
    const from = state.sub;
    if (to === from || meter().compound) return;
    const map = to === 3 ? TO_TRIPLETS : TO_SIXTEENTHS;
    reshape({ meter: state.meter, sub: to, grid: beats() * to }, (s) => Math.floor(s / from) * to + map[s % from]);
  }

  /* Switching the time signature keeps each hit where it falls in its bar, counted in eighth notes,
     and drops what no longer fits: 4/4 to 3/4 loses beat 4, 3/4 and 6/8 share their six eighths. */
  function setMeter(id) {
    if (id === state.meter || !METERS[id]) return;
    const fromGrid = state.grid;
    const eighthsPerStep = meter().compound ? 1 : 2 / state.sub;
    const sub = METERS[id].compound ? 3 : meter().compound ? 4 : state.sub;
    const to = { meter: id, sub, grid: METERS[id].beats * sub };
    const stepsPerEighth = METERS[id].compound ? 1 : sub / 2;
    reshape(to, (s) => {
      const t = Math.round((s % fromGrid) * eighthsPerStep * stepsPerEighth);
      return t < to.grid ? Math.floor(s / fromGrid) * to.grid + t : -1;
    });
  }

  document.querySelectorAll('input[name="feel"]').forEach((r) => r.addEventListener('change', () => setFeel(+r.value)));
  document.querySelectorAll('input[name="meter"]').forEach((r) => r.addEventListener('change', () => setMeter(r.value)));

  function renderShapeControls() {
    document.querySelectorAll('input[name="meter"]').forEach((r) => { r.checked = r.value === state.meter; });
    document.querySelectorAll('input[name="feel"]').forEach((r) => { r.checked = +r.value === state.sub; });
    $('#feel').hidden = !!meter().compound;
  }

  function onPatternChange() {
    if (builtShape !== shapeKey()) buildSeq();
    renderShapeControls();
    renderPads();
    renderScore();
    renderKey();
    renderEdited();
  }

  /* ---------- Score ---------- */
  const SP = 14;
  const STAFF_TOP = 80;
  const STAFF_BOTTOM = STAFF_TOP + 4 * SP;
  const yOf = (pos) => STAFF_BOTTOM - pos * (SP / 2);
  const HEAD = 6.2;

  const headSvg = (inst, x, y, level) => {
    let out = '';
    if (inst.pos >= 10) out += `<line class="ledger" x1="${x - 9}" x2="${x + 9}" y1="${yOf(10)}" y2="${yOf(10)}"/>`;
    if (inst.head === 'o') out += `<ellipse class="head-o" cx="${x}" cy="${y}" rx="${HEAD}" ry="4.7" transform="rotate(-20 ${x} ${y})"/>`;
    else out += `<path class="head-x" d="M${x - 5} ${y - 5}L${x + 5} ${y + 5}M${x - 5} ${y + 5}L${x + 5} ${y - 5}"/>`;
    if (inst.head === 'c') out += `<circle class="mark" cx="${x}" cy="${y}" r="7.5"/>`;
    if (level === GHOST) out += `<path class="mark" d="M${x - 10} ${y - 7}q-4 7 0 14M${x + 10} ${y - 7}q4 7 0 14"/>`;
    return out;
  };

  const restQuarter = (x) => {
    const y = STAFF_TOP + 2 * SP;
    return `<path class="rest" d="M${x - 3} ${y - 16}l6 8l-6 7l6 7c-6 -3 -9 1 -4 7"/>`;
  };
  const rest8 = (x, extra = 0) => {
    const y = STAFF_TOP + 2 * SP - 4;
    return `<circle class="rest-dot" cx="${x - 3}" cy="${y - 2}" r="2.6"/><path class="rest" d="M${x - 3} ${y}q4 2 7 -3L${x - 1} ${y + 16 + extra}"/>`;
  };
  const rest16 = (x) => {
    const y = STAFF_TOP + 2 * SP + 4;
    return rest8(x + 2, 8) + `<circle class="rest-dot" cx="${x - 2}" cy="${y}" r="2.6"/><path class="rest" d="M${x - 2} ${y + 2}q4 2 7 -3" />`;
  };

  function renderScore() {
    const svgRect = svg.getBoundingClientRect();
    const lanesRect = lanes.getBoundingClientRect();
    const firstRow = pads[INSTRUMENTS[0].id];
    if (!firstRow || !svgRect.width) return;
    setNow(-1);
    const W = svgRect.width;
    const grid = state.grid;
    const n = sub();
    const triplet = n === 3;
    const compound = !!meter().compound;
    svgOffset = svgRect.left - lanesRect.left;
    centers = firstRow.map((b) => { const r = b.getBoundingClientRect(); return r.left + r.width / 2 - svgRect.left; });
    const firstLeft = firstRow[0].getBoundingClientRect().left - svgRect.left;
    const hasSticking = state.sticking && /[RL]/.test(state.sticking);
    // Triplets in the feet voice print their 3 below the beam, so the score takes a little more room.
    const H = (hasSticking ? 222 : 198) + (triplet && !compound ? 12 : 0);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('height', H);

    let out = '';
    for (let i = 0; i < 5; i++) out += `<line class="staff" x1="0" x2="${W}" y1="${STAFF_TOP + i * SP}" y2="${STAFF_TOP + i * SP}"/>`;
    const clefX = Math.max(10, firstLeft - 70);
    out += `<rect class="clef" x="${clefX}" y="${STAFF_TOP + SP}" width="4" height="${2 * SP}"/><rect class="clef" x="${clefX + 8}" y="${STAFF_TOP + SP}" width="4" height="${2 * SP}"/>`;
    const tsX = firstLeft - 34;
    out += `<text class="timesig" x="${tsX}" y="${STAFF_TOP + 2 * SP - 1}" text-anchor="middle">${meter().top}</text><text class="timesig" x="${tsX}" y="${STAFF_BOTTOM - 1}" text-anchor="middle">${meter().bottom}</text>`;
    out += `<line class="barline" x1="0.6" x2="0.6" y1="${STAFF_TOP}" y2="${STAFF_BOTTOM}"/>`;
    for (let b = 1; b < BARS; b++) {
      const midX = (centers[b * grid - 1] + centers[b * grid]) / 2;
      out += `<line class="barline" x1="${midX}" x2="${midX}" y1="${STAFF_TOP}" y2="${STAFF_BOTTOM}"/>`;
    }
    const endX = W - 3;
    out += `<circle class="rest-dot" cx="${endX - 12}" cy="${STAFF_TOP + 1.5 * SP}" r="2"/><circle class="rest-dot" cx="${endX - 12}" cy="${STAFF_TOP + 2.5 * SP}" r="2"/>`;
    out += `<line class="barline" x1="${endX - 6}" x2="${endX - 6}" y1="${STAFF_TOP}" y2="${STAFF_BOTTOM}"/><rect class="thick" x="${endX - 3}" y="${STAFF_TOP}" width="3.5" height="${4 * SP}"/>`;

    const heads = Array.from({ length: total() }, () => '');
    let lines = '';

    for (const voice of ['hands', 'feet']) {
      const up = voice === 'hands';
      const insts = INSTRUMENTS.filter((i) => i.voice === voice);
      const hitsAt = (s) => insts.filter((i) => state.pattern[i.id][s]);
      for (let bar = 0; bar < BARS; bar++) {
        const ys = [];
        for (let s = bar * grid; s < (bar + 1) * grid; s++) for (const h of hitsAt(s)) ys.push(yOf(h.pos));
        if (!ys.length && !up) continue;
        const beamY = up
          ? Math.min((ys.length ? Math.min(...ys) : yOf(5)) - 3.5 * SP, STAFF_TOP - SP / 2)
          : Math.max(Math.max(...ys) + 3.5 * SP, STAFF_BOTTOM + 2.5 * SP);
        const dir = up ? 1 : -1;
        const thick = 4.5;
        const beamRect = (x1, x2, offset) => {
          const y = up ? beamY + offset : beamY - offset - thick;
          return `<rect class="beam" x="${Math.min(x1, x2) - 0.6}" y="${y}" width="${Math.abs(x2 - x1) + 1.2}" height="${thick}"/>`;
        };
        const flags = (note, count) => {
          let f = '';
          for (let k = 0; k < count; k++) f += `<path class="flag" d="M${note.stemX} ${beamY + dir * k * 7}c1 ${dir * 7} 11 ${dir * 9} 8 ${dir * 20}"/>`;
          return f;
        };

        for (let q = 0; q < beats(); q++) {
          const base = bar * grid + q * n;
          const on = [...Array(n).keys()].filter((i) => hitsAt(base + i).length);
          if (!on.length) {
            // A silent beat is a quarter rest, or in 6/8 a dotted quarter rest.
            const rx = (centers[base] + centers[base + n - 1]) / 2;
            if (up) lines += restQuarter(rx) + (compound ? `<circle class="rest-dot" cx="${rx + 9}" cy="${STAFF_TOP + 1.5 * SP}" r="2"/>` : '');
            continue;
          }
          if (up && on[0] > 0) {
            if (triplet) lines += on[0] === 1 ? rest8(centers[base]) : restQuarter((centers[base] + centers[base + 1]) / 2);
            else if (on[0] === 1) lines += rest16(centers[base]);
            else if (on[0] === 2) lines += rest8(centers[base]);
            else lines += rest8(centers[base]) + rest16(centers[base + 2]);
          }
          const notes = on.map((i, k) => {
            const s = base + i;
            const hits = hitsAt(s);
            const x = centers[s];
            return { s, x, hits, hy: hits.map((h) => yOf(h.pos)), dur: (k < on.length - 1 ? on[k + 1] : n) - i, stemX: up ? x + HEAD - 0.4 : x - HEAD + 0.4 };
          });

          for (const note of notes) {
            const from = up ? Math.max(...note.hy) : Math.min(...note.hy);
            lines += `<line class="stem" x1="${note.stemX}" x2="${note.stemX}" y1="${from}" y2="${beamY}"/>`;
            let markY = beamY - dir * 9;
            for (const h of note.hits) {
              const y = yOf(h.pos);
              heads[note.s] += headSvg(h, note.x, y, state.pattern[h.id][note.s]);
              if (note.dur === 3 && (!triplet || compound)) heads[note.s] += `<circle class="head-o" cx="${note.x + 10}" cy="${h.pos % 2 === 0 ? y - SP / 2 : y}" r="1.6"/>`;
            }
            if (note.hits.some((h) => state.pattern[h.id][note.s] === ACCENT)) {
              heads[note.s] += `<path class="mark" d="M${note.x - 5} ${markY - 3.5}L${note.x + 5} ${markY}L${note.x - 5} ${markY + 3.5}"/>`;
              markY -= dir * 9;
            }
            if (note.hits.some((h) => h.open)) heads[note.s] += `<circle class="mark" cx="${note.x}" cy="${markY}" r="3.2"/>`;
          }

          if (triplet) {
            // Triplets and 6/8 eighths: runs of one-step notes share a beam, a lone one takes a flag, two steps is a quarter,
            // three in 6/8 a dotted quarter. Only triplets carry the 3.
            let run = [];
            const flush = () => {
              if (run.length > 1) lines += beamRect(run[0].stemX, run[run.length - 1].stemX, 0);
              else if (run.length === 1) lines += flags(run[0], 1);
              run = [];
            };
            for (const note of notes) {
              if (note.dur === 1) run.push(note);
              else flush();
            }
            flush();
            if (!compound && !(on.length === 1 && on[0] === 0)) {
              const tx = centers[base + 1];
              const ty = up ? Math.max(12, beamY - 12) : Math.min(H - 4, beamY + 14);
              lines += `<text class="tuplet" x="${tx}" y="${ty}" text-anchor="middle">3</text>`;
            }
          } else if (notes.length === 1) {
            const note = notes[0];
            lines += flags(note, note.dur === 4 ? 0 : note.dur === 1 ? 2 : 1);
          } else {
            lines += beamRect(notes[0].stemX, notes[notes.length - 1].stemX, 0);
            const covered = new Set();
            for (let k = 0; k < notes.length - 1; k++) {
              if (notes[k].dur === 1 && notes[k + 1].dur === 1) {
                lines += beamRect(notes[k].stemX, notes[k + 1].stemX, 7.5);
                covered.add(k); covered.add(k + 1);
              }
            }
            notes.forEach((note, k) => {
              if (note.dur !== 1 || covered.has(k)) return;
              lines += k === 0 ? beamRect(note.stemX, note.stemX + 9, 7.5) : beamRect(note.stemX - 9, note.stemX, 7.5);
            });
          }
        }
      }
    }

    if (hasSticking) {
      for (let s = 0; s < total(); s++) {
        const c = state.sticking[s];
        if (c === 'R' || c === 'L') lines += `<text class="sticking" x="${centers[s]}" y="${H - 8}" text-anchor="middle">${c}</text>`;
      }
    }

    out += `<g>${lines}</g>`;
    out += heads.map((h, s) => `<g class="step" data-step="${s}">${h}</g>`).join('');
    const feel = compound ? '' : triplet ? ', written in eighth-note triplets' : '';
    svg.innerHTML = `<title id="score-title">Drum score, two bars in ${state.meter}${feel}${hasSticking ? ', with sticking' : ''}</title>` + out;
    stepGroups = svg.querySelectorAll('.step');
  }
  let stepGroups = [];

  function movePlayhead(step, frac) {
    if (!centers.length || step >= centers.length) return;
    const x0 = centers[step];
    const next = step % state.grid === state.grid - 1 ? x0 + (centers[step] - centers[step - 1]) : centers[step + 1];
    const x = svgOffset + x0 + (next - x0) * frac;
    playhead.style.transform = `translateX(${x}px)`;
    playhead.classList.add('is-on');
  }

  function setNow(step) {
    if (step === nowStep) return;
    if (nowStep >= 0) {
      if (stepGroups[nowStep]) stepGroups[nowStep].classList.remove('is-now');
      for (const i of INSTRUMENTS) if (pads[i.id] && pads[i.id][nowStep]) pads[i.id][nowStep].classList.remove('is-now');
    }
    nowStep = step;
    if (step >= 0) {
      if (stepGroups[step]) stepGroups[step].classList.add('is-now');
      for (const i of INSTRUMENTS) if (pads[i.id] && pads[i.id][step]) pads[i.id][step].classList.add('is-now');
    }
  }

  /* ---------- Key to the noteheads and marks in use ---------- */
  function renderKey() {
    const used = INSTRUMENTS.filter((i) => state.pattern[i.id].some(Boolean));
    const key = $('#key');
    if (!used.length) {
      key.innerHTML = '<span>An empty groove. Click a pad to place a hit.</span>';
      return;
    }
    const all = INSTRUMENTS.flatMap((i) => state.pattern[i.id]);
    const stroke = 'fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"';
    const glyph = (body) => `<svg viewBox="0 0 22 22" width="18" height="20" aria-hidden="true">${body}</svg>`;
    const xHead = `<path d="M7 11L15 19M7 19L15 11" ${stroke}/>`;
    const items = used.map((i) => {
      let body = i.head === 'o' ? '<ellipse cx="11" cy="15" rx="5" ry="3.8" fill="currentColor" transform="rotate(-20 11 15)"/>' : xHead;
      if (i.head === 'c') body += `<circle cx="11" cy="15" r="6.5" ${stroke}/>`;
      if (i.open) body += `<circle cx="11" cy="4" r="2.4" ${stroke}/>`;
      return `<span>${glyph(body)}${i.name}</span>`;
    });
    if (all.includes(ACCENT)) items.push(`<span>${glyph(`<path d="M6 11L16 15L6 19" ${stroke}/>`)}Accent</span>`);
    if (all.includes(GHOST)) items.push(`<span>${glyph(`<path d="M7 9q-4 6 0 12M15 9q4 6 0 12" ${stroke}/>`)}Ghost note</span>`);
    if (meter().compound) items.push(`<span>${glyph('<ellipse cx="8" cy="16" rx="4.2" ry="3.2" fill="currentColor" transform="rotate(-20 8 16)"/><path d="M11.6 15V3" ' + stroke + '/><circle cx="16" cy="17" r="1.4" fill="currentColor"/>')}One beat, a dotted quarter</span>`);
    else if (state.sub === 3) items.push(`<span>${glyph('<text x="11" y="17" text-anchor="middle" class="key__tuplet">3</text>')}Triplet</span>`);
    key.innerHTML = items.join('');
  }

  /* ---------- Library ---------- */
  function renderLibrary() {
    const units = $('#units');
    const tabs = GROUPS.map((c) => `<button class="collections__tab" type="button" role="tab" id="tab-${c.id}" aria-controls="panel-${c.id}" aria-selected="${state.view === c.id}" tabindex="${state.view === c.id ? 0 : -1}">${c.tab}</button>`).join('');
    const panels = GROUPS.map((c) => `
      <div class="collections__panel" role="tabpanel" id="panel-${c.id}" aria-labelledby="tab-${c.id}"${state.view === c.id ? '' : ' hidden'}>
        ${c.units.filter((u) => u.items.length).map((u, n) => `
        <section class="library__group" aria-labelledby="unit-${c.id}-${n}">
          <h2 id="unit-${c.id}-${n}">${u.title}</h2>
          <ol class="ex-list">${u.items.map((ex) => {
            const best = bests[ex.id];
            return `<li><a class="ex" href="?ex=${ex.id}" data-ex="${ex.id}"${state.kind === 'exercise' && state.item.id === ex.id ? ' aria-current="page"' : ''}>
              <span class="ex__name">${ex.title}</span>
              <span class="ex__meta"><span>${ex.kind}</span>${shapeOf(ex).meter !== '4/4' ? `<span>${ex.meter}</span>` : ''}<span>Goal <span class="measured">${ex.goal}</span> BPM</span>${best ? `<span class="ex__best">Clean at <span class="measured">${best.bpm}</span></span>` : ''}</span>
            </a></li>`;
          }).join('')}</ol>
        </section>`).join('')}
      </div>`).join('');
    units.innerHTML = `<div class="collections" role="tablist" aria-label="Collections">${tabs}</div>${panels}`;

    const list = $('#grooves');
    list.innerHTML = grooves.map((g) => `<li>
      <a class="ex" href="?groove=${g.id}" data-groove="${g.id}"${state.kind === 'groove' && state.item.id === g.id ? ' aria-current="page"' : ''}>
        <span class="ex__name">${esc(g.name)}</span>
        <span class="ex__meta"><span>${shapeName(shapeOf(g))}</span><span><span class="measured">${g.bpm}</span> BPM</span><span>Saved ${dateFmt.format(new Date(g.saved))}</span></span>
      </a>
      <button class="btn btn--icon" type="button" data-delete="${g.id}" aria-label="Delete ${esc(g.name)}">
        <svg class="icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>
      </button>
    </li>`).join('');
    $('#grooves-empty').hidden = grooves.length > 0;
    $('#grooves-export').disabled = !grooves.length;
  }

  function showCollection(id, focus) {
    state.view = id;
    renderLibrary();
    if (focus) document.getElementById('tab-' + id).focus();
  }

  $('.library').addEventListener('click', (e) => {
    const tab = e.target.closest('.collections__tab');
    if (tab) { showCollection(tab.id.replace('tab-', ''), true); return; }
    const link = e.target.closest('a[data-ex], a[data-groove]');
    if (link) {
      e.preventDefault();
      if (link.dataset.ex) load('exercise', link.dataset.ex, null, true);
      else load('groove', link.dataset.groove, null, true);
      $('.library').classList.remove('is-open');
      $('.library__toggle').setAttribute('aria-expanded', 'false');
      return;
    }
    const del = e.target.closest('[data-delete]');
    if (del) deleteGroove(del.dataset.delete);
  });

  $('.library').addEventListener('keydown', (e) => {
    const tab = e.target.closest('.collections__tab');
    if (!tab || (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft')) return;
    e.preventDefault();
    const i = GROUPS.findIndex((c) => c.id === state.view);
    const next = GROUPS[(i + (e.key === 'ArrowRight' ? 1 : GROUPS.length - 1)) % GROUPS.length];
    showCollection(next.id, true);
  });

  $('.library__toggle').addEventListener('click', (e) => {
    const lib = $('.library');
    const open = !lib.classList.contains('is-open');
    lib.classList.toggle('is-open', open);
    e.currentTarget.setAttribute('aria-expanded', String(open));
  });

  let undoTimer = null;
  function deleteGroove(id) {
    const index = grooves.findIndex((g) => g.id === id);
    if (index < 0) return;
    const [removed] = grooves.splice(index, 1);
    store.set('grooves', grooves);
    renderLibrary();
    const status = $('#grooves-status');
    status.innerHTML = '';
    status.append(`Deleted ${removed.name}.`);
    const undo = document.createElement('button');
    undo.type = 'button';
    undo.textContent = 'Undo';
    undo.addEventListener('click', () => {
      grooves.splice(index, 0, removed);
      store.set('grooves', grooves);
      status.textContent = '';
      clearTimeout(undoTimer);
      renderLibrary();
    });
    status.append(undo);
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => { status.textContent = ''; }, 8000);
  }

  /* ---------- Exporting and importing grooves ---------- */
  function groovesSay(msg) {
    clearTimeout(undoTimer);
    $('#grooves-status').textContent = msg;
  }
  const plural = (n) => `${n} groove${n === 1 ? '' : 's'}`;

  $('#grooves-export').addEventListener('click', () => {
    if (!grooves.length) return;
    const data = { app: 'play-drums', version: 1, exported: new Date().toISOString(), grooves };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `play-drums-grooves-${todayKey}.json`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    groovesSay(`Exported ${plural(grooves.length)} to ${a.download}.`);
  });

  /* A groove from a file is rebuilt field by field: anything unknown or malformed is dropped or replaced. */
  function cleanGroove(raw) {
    if (!raw || typeof raw !== 'object' || !raw.pattern || typeof raw.pattern !== 'object') return null;
    const sh = shapeOf({ meter: raw.meter, sub: raw.sub === 3 || raw.sub === 4 ? raw.sub : undefined, grid: raw.grid === 12 ? 12 : 16 });
    const len = sh.grid * BARS;
    const pattern = {};
    let rows = 0;
    for (const i of INSTRUMENTS) {
      const row = raw.pattern[i.id];
      const ok = Array.isArray(row) && row.length === len;
      if (ok) rows++;
      pattern[i.id] = ok ? row.map((v) => (v === 1 || v === 2 || v === 3 ? v : 0)) : empty(sh.grid);
    }
    if (!rows) return null;
    return {
      id: typeof raw.id === 'string' && /^[a-z0-9-]{1,40}$/i.test(raw.id) ? raw.id : null,
      name: typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim().slice(0, 60) : null,
      bpm: Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(+raw.bpm) || 90)),
      ...sh,
      saved: Number.isNaN(Date.parse(raw.saved)) ? new Date().toISOString() : new Date(raw.saved).toISOString(),
      pattern,
      sticking: typeof raw.sticking === 'string' && raw.sticking.length === len && /^[RL-]+$/.test(raw.sticking) ? raw.sticking : null,
    };
  }

  /* Two grooves are the same groove when their time, grid and every hit match, whatever they are called. */
  const fingerprint = (g) => JSON.stringify([g.meter, g.sub, INSTRUMENTS.map((i) => g.pattern[i.id])]);

  function importGrooves(text) {
    let data;
    try { data = JSON.parse(text); } catch { data = null; }
    const list = Array.isArray(data) ? data : data && Array.isArray(data.grooves) ? data.grooves : data && data.pattern ? [data] : null;
    const found = list ? list.map(cleanGroove).filter(Boolean) : [];
    if (!found.length) {
      groovesSay('That file has no grooves this app can read. Choose a file made with Export grooves.');
      return;
    }
    const prints = new Set(grooves.map((g) => { const sh = shapeOf(g); return fingerprint({ ...sh, pattern: normalize(g.pattern, sh.grid) }); }));
    const ids = new Set(grooves.map((g) => g.id));
    const names = new Set(grooves.map((g) => g.name));
    let n = grooves.reduce((m, g) => Math.max(m, +(g.name.match(/\d+$/) || [0])[0]), 0);
    const added = [];
    for (const g of found) {
      const print = fingerprint(g);
      if (prints.has(print)) continue;
      prints.add(print);
      if (!g.id || ids.has(g.id)) g.id = 'g' + Date.now().toString(36) + added.length;
      ids.add(g.id);
      if (!g.name) g.name = 'Groove ' + ++n;
      else if (names.has(g.name)) g.name = g.name.slice(0, 50) + ', imported';
      names.add(g.name);
      added.push(g);
    }
    const skipped = found.length - added.length;
    if (!added.length) {
      groovesSay(`Nothing new: ${found.length === 1 ? 'that groove is' : found.length === 2 ? 'both grooves are' : `all ${found.length} grooves are`} already in your list.`);
      return;
    }
    grooves.unshift(...added);
    store.set('grooves', grooves);
    renderLibrary();
    groovesSay(`Imported ${plural(added.length)}.${skipped ? ` ${plural(skipped)} already in your list ${skipped === 1 ? 'was' : 'were'} skipped.` : ''}`);
  }

  const fileInput = $('#grooves-file');
  $('#grooves-import').addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    fileInput.value = '';
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { groovesSay('That file is too large to be a groove file.'); return; }
    file.text().then(importGrooves, () => groovesSay('That file could not be read. Try choosing it again.'));
  });

  /* ---------- Header and readings ---------- */
  function renderHeader() {
    const it = state.item;
    const isEx = state.kind === 'exercise';
    $('#ex-title').textContent = isEx ? it.title : it.name;
    $('#ex-focus').textContent = isEx ? it.focus : `Your groove, saved ${dateFmt.format(new Date(it.saved))} at ${it.bpm} BPM.`;
    $('#crumb-collection').textContent = isEx ? it.collectionTitle : 'My grooves';
    $('#crumb-unit').textContent = isEx ? it.unit : shapeName(shapeOf(it));
    $('#crumb-item').textContent = isEx ? it.title : it.name;
    $('#ex-goal-label').textContent = isEx ? 'Goal' : 'Saved at';
    $('#ex-goal').textContent = `${isEx ? it.goal : it.bpm} BPM`;
    document.title = `Practice: ${(isEx ? it.title : it.name).toLowerCase()}, Play Drums`;
    renderBest();
    renderEdited();
  }

  function renderBest() {
    const best = bests[itemKey()];
    const dd = $('#ex-best');
    dd.textContent = best ? `${best.bpm} BPM on ${dateFmt.format(new Date(best.date))}` : 'None yet';
    dd.classList.toggle('is-person', !!best);
    dd.classList.toggle('measured', !!best);
    $('#mark-clean').textContent = `Mark a clean run at ${state.bpm} BPM`;
  }

  const itemKey = () => (state.kind === 'exercise' ? state.item.id : 'groove:' + state.item.id);
  const itemShape = () => shapeOf(state.item);

  function renderEdited() {
    const sh = itemShape();
    const edited = shapeKey() !== sh.meter + ':' + sh.sub || !samePattern(state.pattern, normalize(state.item.pattern, sh.grid));
    $('#ex-edited').hidden = !edited;
    const reset = $('#bb-reset');
    reset.disabled = !edited;
    reset.textContent = state.kind === 'exercise' ? 'Back to the exercise' : 'Back to the saved groove';
  }

  function renderToday() {
    const secs = Math.floor((practice[todayKey] || 0) + practisedSinceSave);
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = String(secs % 60).padStart(2, '0');
    $('#today').textContent = h ? `${h}:${String(m).padStart(2, '0')}:${s}` : `${m}:${s}`;
  }

  function renderPlayButton() {
    $('#play-label').textContent = state.playing ? 'Stop' : 'Play';
    $('#play-icon').innerHTML = state.playing ? '<rect x="3.5" y="3.5" width="9" height="9" rx="1"/>' : '<path d="M4 2.5v11l9-5.5z"/>';
  }

  /* ---------- Tempo ---------- */
  const BPM_MIN = +bpmInput.min;
  const BPM_MAX = +bpmInput.max;
  let urlTimer = null;
  function setBpm(v) {
    state.bpm = Math.max(BPM_MIN, Math.min(BPM_MAX, Math.round(v)));
    bpmInput.value = state.bpm;
    bpmOut.textContent = state.bpm;
    $('#mark-clean').textContent = `Mark a clean run at ${state.bpm} BPM`;
    clearTimeout(urlTimer);
    urlTimer = setTimeout(() => writeURL(false), 300);
  }

  bpmInput.addEventListener('input', () => setBpm(+bpmInput.value));
  $('#tempo-down').addEventListener('click', () => setBpm(state.bpm - 1));
  $('#tempo-up').addEventListener('click', () => setBpm(state.bpm + 1));

  let taps = [];
  function tap() {
    const now = performance.now();
    taps = taps.filter((t) => now - t < 2500);
    taps.push(now);
    if (taps.length >= 2) {
      const gaps = taps.slice(1).map((t, i) => t - taps[i]).slice(-4);
      setBpm(60000 / (gaps.reduce((a, b) => a + b, 0) / gaps.length));
    }
  }
  $('#tap').addEventListener('click', tap);

  /* ---------- Toggles and actions ---------- */
  const toggles = { 'opt-click': 'click', 'opt-countin': 'countIn', 'opt-groove': 'groove' };
  for (const [id, key] of Object.entries(toggles)) {
    const el = document.getElementById(id);
    el.addEventListener('click', () => {
      state.opts[key] = !state.opts[key];
      el.setAttribute('aria-pressed', String(state.opts[key]));
    });
  }

  $('#play').addEventListener('click', () => (state.playing ? stop() : start()));

  $('#mark-clean').addEventListener('click', () => {
    const key = itemKey();
    const prev = bests[key];
    if (!prev || state.bpm >= prev.bpm) bests[key] = { bpm: state.bpm, date: new Date().toISOString() };
    store.set('bests', bests);
    renderBest();
    renderLibrary();
  });

  $('#bb-reset').addEventListener('click', () => {
    setShape(itemShape());
    state.pattern = normalize(state.item.pattern, state.grid);
    state.sticking = state.item.sticking || null;
    onPatternChange();
  });

  $('#bb-clear').addEventListener('click', () => {
    for (const i of INSTRUMENTS) state.pattern[i.id].fill(0);
    state.sticking = null;
    onPatternChange();
  });

  $('#bb-save').addEventListener('click', () => {
    const n = grooves.reduce((m, g) => Math.max(m, +(g.name.match(/\d+$/) || [0])[0]), 0) + 1;
    const g = { id: 'g' + Date.now().toString(36), name: 'Groove ' + n, bpm: state.bpm, meter: state.meter, sub: state.sub, grid: state.grid, saved: new Date().toISOString(), pattern: clone(state.pattern), sticking: state.sticking };
    grooves.unshift(g);
    store.set('grooves', grooves);
    load('groove', g.id, state.bpm, true);
  });

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const typing = t.closest && t.closest('input:not([type="radio"]):not([type="range"]), textarea, select, [contenteditable]');
    const onControl = t.closest && t.closest('button, a, input');
    if (e.key === ' ' && !onControl && !typing) { e.preventDefault(); state.playing ? stop() : start(); }
    else if (typing) return;
    else if (e.key === '+' || e.key === '=') setBpm(state.bpm + 1);
    else if (e.key === '-' || e.key === '_') setBpm(state.bpm - 1);
    else if (e.key === 't' || e.key === 'T') tap();
  });

  /* ---------- Loading an item and the URL ---------- */
  function writeURL(push) {
    const u = new URL(location.href);
    u.search = '';
    u.searchParams.set(state.kind === 'groove' ? 'groove' : 'ex', state.item.id);
    u.searchParams.set('bpm', state.bpm);
    try { history[push ? 'pushState' : 'replaceState'](null, '', u); } catch { /* file:// pages may refuse */ }
  }

  function load(kind, id, bpm, push) {
    let item = kind === 'groove' ? grooves.find((g) => g.id === id) : EXERCISES.get(id);
    if (!item) { kind = 'exercise'; item = EXERCISES.get('basic-rock'); }
    state.kind = kind;
    state.item = item;
    setShape(shapeOf(item));
    state.pattern = normalize(item.pattern, state.grid);
    state.sticking = item.sticking || null;
    if (kind === 'exercise') state.view = item.collection;
    if (state.playing) { nextStep %= total(); queue = queue.filter((q) => q.count); shown = null; }
    setBpm(bpm || (kind === 'groove' ? item.bpm : item.start));
    renderHeader();
    renderLibrary();
    onPatternChange();
    writeURL(push);
  }

  function loadFromURL() {
    const q = new URLSearchParams(location.search);
    const bpm = +q.get('bpm') || null;
    if (q.get('groove')) load('groove', q.get('groove'), bpm, false);
    else load('exercise', q.get('ex') || 'basic-rock', bpm, false);
  }

  window.addEventListener('popstate', loadFromURL);
  window.addEventListener('pagehide', savePractice);

  /* ---------- Boot ---------- */
  renderToday();
  renderPlayButton();
  loadFromURL();
  new ResizeObserver(() => renderScore()).observe(lanes);
  if (document.fonts) document.fonts.ready.then(renderScore);
})();
