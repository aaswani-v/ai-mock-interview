import { useState, useEffect, useRef } from 'react';

const useInView = (options = {}) => {
    const [ref, setRef] = useState(null);
    const [isInView, setIsInView] = useState(false);

    // Memoize options to prevent unnecessary re-runs
    const stableOptions = useRef(options);

    useEffect(() => {
        if (!ref) return;
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setIsInView(true);
                observer.disconnect();
            }
        }, stableOptions.current);
        observer.observe(ref);
        return () => observer.disconnect();
    }, [ref]);

    return [setRef, isInView];
};

export default useInView;
