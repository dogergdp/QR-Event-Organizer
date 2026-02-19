import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

type EventData = {
    id: number;
    name: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    description: string;
    location: string;
    banner_image?: string | null;
    is_finished?: boolean;
};

export default function EditEvent({ event }: { event: EventData }) {
    const { data, setData, put, processing, errors } = useForm({
        name: event.name,
        date: event.date,
        start_time: event.start_time ?? '',
        end_time: event.end_time ?? '',
        description: event.description,
        location: event.location,
        banner_image: event.banner_image ?? '',
        is_finished: event.is_finished ?? false,
    });

    const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        put(`/events/${event.id}`);
    };

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
        },
        {
            title: 'Edit Event',
            href: `/events/${event.id}/edit`,
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-xl font-semibold text-foreground">
                        Edit Event
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Update event details.
                    </p>
                </div>
                <form
                    onSubmit={handleSubmit}
                    className="rounded-xl border border-sidebar-border/70 bg-background p-4"
                >
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Event Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                name="location"
                                value={data.location}
                                onChange={(e) => setData('location', e.target.value)}
                                required
                            />
                            <InputError message={errors.location} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                                id="date"
                                type="date"
                                name="date"
                                value={data.date}
                                onChange={(e) => setData('date', e.target.value)}
                                required
                            />
                            <InputError message={errors.date} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="start_time">Start Time</Label>
                            <Input
                                id="start_time"
                                type="time"
                                name="start_time"
                                value={data.start_time}
                                onChange={(e) =>
                                    setData('start_time', e.target.value)
                                }
                                required
                            />
                            <InputError message={errors.start_time} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="end_time">End Time</Label>
                            <Input
                                id="end_time"
                                type="time"
                                name="end_time"
                                value={data.end_time}
                                onChange={(e) => setData('end_time', e.target.value)}
                                required
                            />
                            <InputError message={errors.end_time} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="description">Description</Label>
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                onChange={(e) =>
                                    setData('description', e.target.value)
                                }
                                required
                                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="banner_image">Banner Image URL</Label>
                            <Input
                                id="banner_image"
                                name="banner_image"
                                value={data.banner_image}
                                onChange={(e) =>
                                    setData('banner_image', e.target.value)
                                }
                                placeholder="https://... or /images/banner.jpg"
                            />
                            <InputError message={errors.banner_image} />
                            <p className="text-xs text-muted-foreground">
                                Optional. If empty, a default banner will be used.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="is_finished"
                                checked={data.is_finished}
                                onCheckedChange={(checked) =>
                                    setData('is_finished', checked === true)
                                }
                            />
                            <Label htmlFor="is_finished">Mark as finished</Label>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
