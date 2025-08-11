/**
 * Transcript Content Extractor
 * Extracts content from p tags within transcript-body div
 * Can be used as a browser script or extension content script
 */

class TranscriptExtractor {
    constructor() {
        this.transcriptBodySelector = 'div[data-testid="transcript-body"]';
        this.timestampClass = 'MuiTypography-uiBodySmall';
        this.contentClass = 'MuiTypography-uiBody';
    }

    /**
     * Extracts all transcript entries from the current page
     * @returns {Array} Array of objects with timestamp and content
     */
    extractTranscript() {
        const transcriptBody = document.querySelector(this.transcriptBodySelector);
        
        if (!transcriptBody) {
            console.warn('Transcript body not found on this page');
            return [];
        }

        const buttons = transcriptBody.querySelectorAll('button');
        const transcriptEntries = [];

        buttons.forEach(button => {
            const timestampElement = button.querySelector(`p.${this.timestampClass}`);
            const contentElement = button.querySelector(`p.${this.contentClass}`);

            if (timestampElement && contentElement) {
                transcriptEntries.push({
                    timestamp: timestampElement.textContent.trim(),
                    content: contentElement.textContent.trim()
                });
            }
        });

        return transcriptEntries;
    }

    /**
     * Extracts only the content (without timestamps)
     * @returns {Array} Array of content strings
     */
    extractContentOnly() {
        const entries = this.extractTranscript();
        return entries.map(entry => entry.content);
    }

    /**
     * Extracts content as a single concatenated string
     * @param {string} separator - String to separate content blocks
     * @returns {string} Concatenated content
     */
    extractContentAsText(separator = ' ') {
        const content = this.extractContentOnly();
        return content.join(separator);
    }

    /**
     * Copies transcript content to clipboard
     * @param {boolean} includeTimestamps - Whether to include timestamps
     * @param {string} separator - String to separate entries
     * @returns {Promise<boolean>} Success status
     */
    async copyToClipboard(includeTimestamps = false, separator = '\n\n') {
        try {
            const entries = this.extractTranscript();
            
            if (entries.length === 0) {
                console.warn('No transcript content found');
                return false;
            }

            let textToCopy;
            if (includeTimestamps) {
                textToCopy = entries.map(entry => 
                    `${entry.timestamp}: ${entry.content}`
                ).join(separator);
            } else {
                textToCopy = entries.map(entry => entry.content).join(separator);
            }

            await navigator.clipboard.writeText(textToCopy);
            console.log(`Copied ${entries.length} transcript entries to clipboard`);
            return true;
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
            return false;
        }
    }

    /**
     * Downloads transcript as a text file
     * @param {string} filename - Name of the file to download
     * @param {boolean} includeTimestamps - Whether to include timestamps
     * @param {string} separator - String to separate entries
     */
    downloadTranscript(filename = 'transcript.txt', includeTimestamps = false, separator = '\n\n') {
        const entries = this.extractTranscript();
        
        if (entries.length === 0) {
            console.warn('No transcript content found');
            return;
        }

        let content;
        if (includeTimestamps) {
            content = entries.map(entry => 
                `${entry.timestamp}: ${entry.content}`
            ).join(separator);
        } else {
            content = entries.map(entry => entry.content).join(separator);
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log(`Downloaded transcript with ${entries.length} entries`);
    }

    /**
     * Creates a summary of the transcript
     * @returns {Object} Summary object
     */
    getSummary() {
        const entries = this.extractTranscript();
        const content = this.extractContentAsText();
        
        return {
            totalEntries: entries.length,
            totalCharacters: content.length,
            totalWords: content.split(/\s+/).length,
            duration: entries.length > 0 ? entries[entries.length - 1].timestamp : '00:00:00',
            firstTimestamp: entries.length > 0 ? entries[0].timestamp : null,
            lastTimestamp: entries.length > 0 ? entries[entries.length - 1].timestamp : null
        };
    }
}

// Usage examples and utility functions
const TranscriptUtils = {
    /**
     * Quick function to extract and log transcript content
     */
    quickExtract() {
        const extractor = new TranscriptExtractor();
        const entries = extractor.extractTranscript();
        console.log('Transcript entries:', entries);
        return entries;
    },

    /**
     * Quick function to copy content to clipboard
     */
    async quickCopy() {
        const extractor = new TranscriptExtractor();
        return await extractor.copyToClipboard(false, ' ');
    },

    /**
     * Quick function to download transcript
     */
    quickDownload() {
        const extractor = new TranscriptExtractor();
        extractor.downloadTranscript('transcript.txt', false, ' ');
    },

    /**
     * Quick function to get summary
     */
    quickSummary() {
        const extractor = new TranscriptExtractor();
        const summary = extractor.getSummary();
        console.log('Transcript summary:', summary);
        return summary;
    }
};

// Auto-execute if running in browser console
if (typeof window !== 'undefined') {
    // Make extractor available globally
    window.TranscriptExtractor = TranscriptExtractor;
    window.TranscriptUtils = TranscriptUtils;
    
    console.log('Transcript Extractor loaded!');
    console.log('Available functions:');
    console.log('- TranscriptUtils.quickExtract() - Extract and log transcript');
    console.log('- TranscriptUtils.quickCopy() - Copy content to clipboard');
    console.log('- TranscriptUtils.quickDownload() - Download transcript file');
    console.log('- TranscriptUtils.quickSummary() - Get transcript summary');
    console.log('- new TranscriptExtractor() - Create extractor instance for custom usage');
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { TranscriptExtractor, TranscriptUtils };
}