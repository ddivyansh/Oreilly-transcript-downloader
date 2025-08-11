document.addEventListener('DOMContentLoaded', function () {
    const statusDiv = document.getElementById('status');

    function showStatus(message, isError = false) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${isError ? 'error-status' : 'success-status'}`;
        statusDiv.style.display = 'block';

        setTimeout(() => {
            statusDiv.style.display = 'none';
        }, 3000);
    }

    // Extract transcript
    document.getElementById('extractBtn').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            const result = await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: () => {
                    const extractor = new TranscriptExtractor();
                    return extractor.extractTranscript();
                }
            });

            const entries = result[0].result;
            if (entries.length > 0) {
                showStatus(`Extracted ${entries.length} transcript entries`);
                console.log('Transcript entries:', entries);
            } else {
                showStatus('No transcript found on this page', true);
            }
        } catch (error) {
            showStatus('Error extracting transcript: ' + error.message, true);
        }
    });

    // Copy content
    document.getElementById('copyBtn').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            const result = await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: () => {
                    const extractor = new TranscriptExtractor();
                    return extractor.copyToClipboard(false, ' ');
                }
            });

            const success = result[0].result;
            if (success) {
                showStatus('Content copied to clipboard!');
            } else {
                showStatus('Failed to copy content', true);
            }
        } catch (error) {
            showStatus('Error copying content: ' + error.message, true);
        }
    });

    // Download file
    document.getElementById('downloadBtn').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: () => {
                    const extractor = new TranscriptExtractor();
                    extractor.downloadTranscript('transcript.txt', false, ' ');
                }
            });

            showStatus('Transcript downloaded!');
        } catch (error) {
            showStatus('Error downloading transcript: ' + error.message, true);
        }
    });

    // Show summary
    document.getElementById('summaryBtn').addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({active: true, currentWindow: true});

            const result = await chrome.scripting.executeScript({
                target: {tabId: tab.id},
                function: () => {
                    const extractor = new TranscriptExtractor();
                    return extractor.getSummary();
                }
            });

            const summary = result[0].result;
            showStatus(`Summary: ${summary.totalEntries} entries, ${summary.totalWords} words`);
            console.log('Transcript summary:', summary);
        } catch (error) {
            showStatus('Error getting summary: ' + error.message, true);
        }
    });
});