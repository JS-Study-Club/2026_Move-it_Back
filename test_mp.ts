import { VideoPoseExtractorUtil } from './src/challenge/utils/video-pose-extractor.util';

async function test() {
  console.log('Initiating test...');
  try {
    const util = new VideoPoseExtractorUtil();
    console.log('Got util, init pose detector...');
    await util.initPose();
    console.log('Pose detector initialized!');
  } catch (err) {
    console.error('Error during init:', err);
  }
}

test();
