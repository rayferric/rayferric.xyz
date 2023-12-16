import style from './page-loader.module.css';

import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { PuffLoader } from 'react-spinners';

export default function PageLoader() {
    const { pathname } = useRouter();
    const [done, setDone] = useState(false);
    const [brandColor, setBrandColor] = useState('#000');

    // Read brand color from CSS
    useEffect(() => {
        const style = getComputedStyle(document.body);
        setBrandColor(style.getPropertyValue('--strong-brand-color'));
    }, []);

    useEffect(() => {
        setDone(false);
        Promise.all(
            Array.from(document.images)
                .filter((img) => !img.complete)
                .map(
                    (img) =>
                        new Promise((resolve) => {
                            img.onload = img.onerror = resolve;
                        })
                )
        ).then(() => {
            setTimeout(() => setDone(true), 200);
        });
    }, [pathname]);

    return (
        <div className={style['page-loader'] + (done ? ' ' + style['done'] : '')}>
            <PuffLoader color={brandColor} size='100px' />
        </div>
    );
}
