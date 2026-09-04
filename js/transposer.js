/**
 * Music Transposer Engine for The Ancient Mariners App
 * Transposes song chords in real-time by semitones (+ / -)
 */

class MusicTransposer {
  static CHROMATIC_SHARPS = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  static CHROMATIC_FLATS  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

  /**
   * Transpose a single chord string (e.g., 'Em', 'F#m', 'B5', 'D/F#') by semitones.
   */
  static transposeChord(chord, semitones) {
    if (!chord || semitones === 0) return chord;

    // Handle slash chords like D/F#
    if (chord.includes('/')) {
      const parts = chord.split('/');
      return `${this.transposeChord(parts[0], semitones)}/${this.transposeChord(parts[1], semitones)}`;
    }

    // Match root note (e.g. C#, Bb, F#, E, B)
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord;

    const root = match[1];
    const suffix = match[2];

    let index = this.CHROMATIC_SHARPS.indexOf(root);
    let useFlats = false;

    if (index === -1) {
      index = this.CHROMATIC_FLATS.indexOf(root);
      useFlats = true;
    }

    if (index === -1) return chord; // Unknown note format

    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    const scale = (useFlats || (semitones < 0 && !root.includes('#'))) 
      ? this.CHROMATIC_FLATS 
      : this.CHROMATIC_SHARPS;

    return scale[newIndex] + suffix;
  }

  /**
   * Transposes raw song content containing [Chord] tags
   */
  static transposeContent(content, semitones) {
    if (semitones === 0) return content;
    return content.replace(/\[([A-G][#b]?[^\]]*)\]/g, (match, chordName) => {
      // Don't transpose structural tags like [TAB], [Verse], [Chorus]
      if (['TAB', '/TAB', 'Verse', 'Chorus', 'Bridge', 'Intro', 'Outro', 'Solo'].some(tag => chordName.startsWith(tag))) {
        return match;
      }
      const transposed = this.transposeChord(chordName, semitones);
      return `[${transposed}]`;
    });
  }
}

window.MusicTransposer = MusicTransposer;
