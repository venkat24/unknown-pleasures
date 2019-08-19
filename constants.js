const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

// Fraction of screen width on which lines are drawn
const WIDTH_FRACTION = 0.40;

// Height from top in pixels to start drawing waves
const START_Y = 110;

// Calculate wave start and end pixel X values based on the above
const WAVE_WIDTH = WIDTH_FRACTION * CANVAS_WIDTH;
const START_X = (CANVAS_WIDTH / 2) - (WAVE_WIDTH / 2);
const END_X = START_X + WAVE_WIDTH;

// Number of frequency bins for the FFT 
const SAMPLE_BINS = 1024;

// Number of ticks of amplitude on the screen at once
// This value higher => curve complexity higher, latency of visualization higher, performance lower 
const SLICE_SIZE = 65;

// I've found that the visualization looks best when low frequencies that are close together
// are shown as separate lines, due to the logarithmic nature of sound perception.
// We can't actually show all 1024 frequency bins, so we sample every n'th bin in the bass, and
// every m'th bin for subsequent bins, where n is smaller than m. n + m is the total number of waves

// n, the number of bass frequencies
const LF_WAVE_COUNT = 15;

//  Decides how often we sample bins in the bass range. If this is k, every kth bin is picked
const LF_WAVE_SEPARATION = 4;

// m, the number of mid and high frequencies
const HF_WAVE_COUNT = 65;

// Decides how often we sample bins in the higher range. If this is k, every kth bin is picked
const HF_WAVE_SEPARATION = 7;

const WAVE_COUNT = LF_WAVE_COUNT + HF_WAVE_COUNT;

// Wave height in pixels
const MAX_WAVE_HEIGHT = 20;

// Gap between each wave in pixels
const SEPARATION = 3;

// Controls the "zoom" of the central peaks.
// Increase this to decrease the size of the middle bump
const GAUSSIAN_SLICE_LENGTH = 22;

// Standard Deviation value of the Gaussian curve used to generate the peaks
const GAUSSIAN_STD_DEVIATION = 3;

// Value at which the curve no longer behaves like a Gaussian, and lays flat
// This value will be added with random noise to get mountains of different sizes
const GAUSSIAN_CUTOFF_BASE = 0.01;

// Each curve has a random value added to cutoff to make the visualization nicer
// This controls how powerful that randomness is
const GAUSSIAN_CUTOFF_RANDOM_STRENGTH = 0.7;

// Higher frequencies naturally have lower amplitudes. We multiply an incremental
// bias to each frequency as the frequency goes up. This should actually be logarithmic,
// but still looks quite good with this linear MULT.
// For example, an increment of 0.01 means each subsequent wave is additionally 0.01 times
// stronger than the previous
const HF_BIAS_MULT_INCREMENT = 0.025;

// Starting value for the above
const HF_BIAS_MULT_BASE = 2.2; 

// Amplitude lower than which a frequency could be considered negligible
// A higher value means you see less activity but only the louder frequencies
const AMPLITUDE_THRESHOLD = 40;
