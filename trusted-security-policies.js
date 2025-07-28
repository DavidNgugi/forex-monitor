import DOMPurify from 'dompurify';

if (window.trustedTypes && window.trustedTypes.createPolicy) { // Feature testing
    window.trustedTypes.createPolicy('default', {
        createHTML: (string) => DOMPurify.sanitize(string, {RETURN_TRUSTED_TYPE: true}),
        createScriptURL: string => string, // warning: this is unsafe!
        createScript: string => string, // warning: this is unsafe!
    });
    
    // Create a specific policy for YouTube iframes
    window.trustedTypes.createPolicy('youtube-iframe', {
        createHTML: (string) => {
            // Allow YouTube iframe content
            if (string.includes('youtube.com') || string.includes('youtu.be')) {
                return DOMPurify.sanitize(string, {
                    RETURN_TRUSTED_TYPE: true,
                    ADD_TAGS: ['iframe'],
                    ADD_ATTR: ['src', 'width', 'height', 'frameborder', 'allow', 'allowfullscreen', 'class']
                });
            }
            return DOMPurify.sanitize(string, {RETURN_TRUSTED_TYPE: true});
        },
        createScriptURL: string => string,
        createScript: string => string,
    });
}