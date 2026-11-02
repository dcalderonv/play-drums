# Drum sounds

These recordings come from **Virtuosity Drums** by Versilian Studios, a contemporary jazz kit played with sticks and recorded at Virtuosity Musical Instruments in Boston. The library is released under **CC0 1.0** (public domain), so the files can be used and shared here without conditions.

- Library: https://versilian-studios.com/virtuosity-drums/
- Source repository: https://github.com/sfzinstruments/virtuosity_drums (licence CC0-1.0)

## What was taken

The "mid" microphone position, one round-robin take each, at three strengths chosen from the library's own velocity maps (`Programs/mappings/mid/*_map.sfz`): around velocity 36 for `soft`, 84 for `medium` and 120 for `hard`.

| App voice | Library articulation |
|---|---|
| kick | `kick_snoff` |
| snare | `snare_center` |
| crossstick | `snare_crossstick` |
| hihat | `hh_closed` |
| openhat | `hh_open` |
| hatfoot | `hh_pedal` |
| hightom | `htom_center` |
| floortom | `ltom_center` |
| ride | `ride_ride` |
| crash | `crash_crash` |

## How they were changed

Mixed to mono, the silence before the hit cut (1.5 ms kept), shortened to a length that suits each drum with a cosine fade over the last 45%, resampled (44.1 kHz for cymbals and hi-hats, 32 kHz for the rest) and saved as 16-bit WAV. Each file was levelled so the medium hits sit like a mixed kit, with the hard hit 4 dB above and the soft hit 9 dB below; one ceiling across the kit keeps every file below clipping.
