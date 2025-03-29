import { useEffect } from 'react';
import Image from 'next/image';

const ImageGen = () => {
    useEffect(() => {
        generateImage();
    }, [generateImage]);

    return (
        <div>
            <Image src="/path/to/image.jpg" alt="Description" width={500} height={300} />
        </div>
    );
};

export default ImageGen;