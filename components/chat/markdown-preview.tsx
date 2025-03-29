import React, { useEffect, useState } from 'react';
import Image from 'next/image';

const MarkdownPreview = () => {
	const [imageSrc, setImageSrc] = useState('');

	useEffect(() => {
		// Your effect logic here
	}, []);

	const Img = () => {
		return <Image src={imageSrc} alt="Preview" />;
	};

	return (
		<div>
			<Img />
		</div>
	);
};

export default MarkdownPreview;