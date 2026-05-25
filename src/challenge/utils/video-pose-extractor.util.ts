import * as fs from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';

export class VideoPoseExtractorUtil {
    /**
     * Python Bridge 방식에서는 별도의 초기화가 필요 없지만, 
     * 기존 코드와의 호환성을 위해 유지합니다.
     */
    async initPose(): Promise<void> {
        console.log('VideoPoseExtractorUtil: Python bridge mode - initialization skipped.');
        return;
    }

    async extractPoseFromVideo(videoBuffer: Buffer, startTime: number = 0, endTime?: number): Promise<any[]> {
        return new Promise((resolve, reject) => {
            console.log('VideoPoseExtractorUtil: Starting pose extraction via Python bridge...');

            const tempVideoPath = path.join(process.cwd(), `temp_video_${Date.now()}.mp4`);
            fs.writeFileSync(tempVideoPath, videoBuffer);

            const modelPath = path.resolve(process.cwd(), 'assets/pose_landmarker_heavy.task');
            const pythonScriptPath = path.resolve(process.cwd(), 'scripts/pose_extractor.py');
            const duration = endTime ? (endTime - startTime).toString() : 'None';
            const targetFps = '10'; // Reduce FPS to 10 to save DB space

            console.log(`Executing Python script: python ${pythonScriptPath} (Target FPS: ${targetFps})`);

            const pythonProcess = spawn('python', [
                pythonScriptPath,
                tempVideoPath,
                modelPath,
                startTime.toString(),
                duration,
                targetFps
            ]);

            let stdoutData = '';
            let stderrData = '';

            pythonProcess.stdout.on('data', (data) => {
                stdoutData += data.toString();
            });

            pythonProcess.stderr.on('data', (data) => {
                stderrData += data.toString();
                console.error(`Python Stderr: ${data}`);
            });

            pythonProcess.on('close', (code) => {
                // Cleanup temp video
                if (fs.existsSync(tempVideoPath)) {
                    fs.unlinkSync(tempVideoPath);
                }

                if (code !== 0) {
                    console.error(`Python process exited with code ${code}`);
                    return reject(new Error(`Python process failed: ${stderrData}`));
                }

                try {
                    const results = JSON.parse(stdoutData);
                    console.log(`Pose extraction complete. Processed ${results.length} frames.`);
                    resolve(results);
                } catch (parseError) {
                    console.error('Failed to parse Python output:', stdoutData);
                    reject(new Error('Failed to parse pose extraction results'));
                }
            });
        });
    }
}



