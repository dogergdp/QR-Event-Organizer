import { usePage } from '@inertiajs/react';
import ShowEventUser from './show-user';
import ShowEventAdmin from './show-admin';
import type { EventShowProps } from './types';

export default function ShowEvent() {
    const { isAdmin } = usePage<any>().props as EventShowProps;

    if (isAdmin) {
        return <ShowEventAdmin />;
    }

    return <ShowEventUser />;
}
