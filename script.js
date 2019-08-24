// Count ticks
let tick = 0;

// Random line cutoff values for each line, calculated once and set
let cutoffs = [];

// Map of sound files and the current sound file
let sounds = {};
let sound;

// Store the set of frequencies for each section
let points = [];
for (let i = 0; i < SLICE_SIZE; ++i) {
  points.push(0);
}

function preload() {
  sounds = {
    "epic": loadSound("sounds/epic.mp3"),
    "electronic": loadSound("sounds/electronic.mp3"),
    "rock": loadSound("sounds/rock.mp3"),
    "metal": loadSound("sounds/metal.mp3")
    // "acoustic": loadSound("sounds/acoustic.mp3"),
    // "indian": loadSound("sounds/indian.mp3"),
  };
  sound = sounds["epic"];
}

// Return y for a Gaussian distribution on x, with given mean and variance
function gaussian(x, mu, sigma) {
  let a = 1 / (sigma * Math.sqrt(2 * PI));
  let power_term = -0.5 * Math.pow(((x - mu) / sigma), 2);

  let y = a * Math.exp(power_term);
  return y;
}

// Transforms a given set of amplitude-time slices into the Unkown Pleasures shape
function transformWithWeights(amps, cutoff) {
  for (let i = 0; i < amps.length; ++i) {
    // Our input x range is the width of the visualization, something like -4 to +4
    // This can be tweaked to see where the central peaks will rise
    // The variance can be tweaked to control the extent and sharpness of the rise
    let x = map(i, 0, amps.length, -GAUSSIAN_SLICE_LENGTH, GAUSSIAN_SLICE_LENGTH);
    let gaussian_adjustment = gaussian(x, 0, GAUSSIAN_STD_DEVIATION);
    
    // We cut the top of the Gaussian curve off at the given cutoff value
    if (gaussian_adjustment > cutoff) {
      gaussian_adjustment = cutoff;
    }

    // Multiply our value by the gaussian weight, squashed to [0, 1]
    let val = amps[i];
    val *= map(gaussian_adjustment, 0, cutoff, 0.05, 0.5);

    amps[i] = val;
  }

  return amps;
}

function setSound(new_sound) {
  sound.pause();
  sound = sounds[new_sound];
  sound.loop();
}

function setup() {
  // Track buttons
  let buttons = [];
  for (let key in sounds) {
    let button = createButton(key);
    button.position(0, 0);
    button.parent("buttons-container");
    button.mousePressed(() => setSound(key));
    buttons.push(button);
  }
  console.log(buttons);

  // Canvas
  var cnv = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  cnv.parent("canvas-container");
  cnv.mouseClicked(togglePlay);
  document.getElementById("main-content-container").style.display = "block";
  fft = new p5.FFT();
}

function draw() {
  
  tick++;

  // FFT the current slice of audio, with SAMPLE_BINS frequency samples
  var spectrum = fft.analyze(SAMPLE_BINS);
  
  // Add this slice to our main data array
  points.push(spectrum);
  if (points.length > SLICE_SIZE) {
    points.shift();
  }

  // Draw title
  background(0);
  noStroke();
  fill(190, 190, 190);
  textFont('Arial');
  textSize(26);
  text("JOY DIVISION", 168, 120);

  // Stroke gray, and fill black to ensure front waves hide the ones behind them
  stroke(200, 200, 200);
  fill(0, 0, 0);
  
  // Generate each wave..
  for (var j = 0; j < WAVE_COUNT; ++j) {

    // Refer to constants.js for an explanation of this section
    // Essentially, we sample more in the bass range and less in the higher range
    let current_bin;
    if (j < LF_WAVE_COUNT) {
      current_bin = j * LF_WAVE_SEPARATION;
    } else {
      current_bin = (LF_WAVE_COUNT * LF_WAVE_SEPARATION) + (j * HF_WAVE_SEPARATION); 
    }

    // Generate a random peak cutoff for each wave
    if (!cutoffs[j]) {
      let random_deviation = GAUSSIAN_CUTOFF_BASE * (Math.random() * 2 - 1)  * GAUSSIAN_CUTOFF_RANDOM_STRENGTH;
      cutoffs[j] = GAUSSIAN_CUTOFF_BASE + random_deviation;
    }

    // Get time slices for just the current bin, across all time slices
    const MULT = HF_BIAS_MULT_BASE + (j * HF_BIAS_MULT_INCREMENT);
    let current_wave_amps = [];
    for (var i = SLICE_SIZE - 1; i >= 0 ; --i) {
      let val = points[i][current_bin] - AMPLITUDE_THRESHOLD;
      val = val < 0 ? 0 : val; // No negs
      val *= MULT;
      current_wave_amps.push(val);
    }
 
    // Transform each slice into the Unknown Pleasures shape
    current_wave_amps = transformWithWeights(current_wave_amps, cutoffs[j]);

    // Base Y value for the current wave
    const sep = SEPARATION * j;

    beginShape();
    for (var i = 0; i < SLICE_SIZE; ++i) {
      var x = map(i, 0, SLICE_SIZE, START_X, END_X);
      var h = map(current_wave_amps[i], 0, 255, START_Y + MAX_WAVE_HEIGHT + sep, START_Y + sep);
      curveVertex(x, h);
    }
    endShape();
  }
}

function togglePlay() {
  if (sound.isPlaying()) {
    sound.pause();
  } else {
    sound.loop();
  }
}
