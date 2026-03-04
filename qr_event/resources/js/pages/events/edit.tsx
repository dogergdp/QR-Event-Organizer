import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';
import { Trash2 } from 'lucide-react';

type EventData = {
    id: number;
    name: string;
    date: string;
    start_time: string | null;
    end_time: string | null;
    description: string | null;
    location: string;
    banner_image?: string | null;
    is_finished?: boolean;
    is_ongoing?: boolean;
};

export default function EditEvent({ event }: { event: EventData }) {
    const today = new Date().toISOString().split('T')[0];
    const defaultBanner = '/images/default-event.jpg';
    const [data, setData] = useState({
        name: event.name,
        date: event.date,
        start_time: event.start_time ?? '',
        end_time: event.end_time ?? '',
        description: event.description ?? '',
        location: event.location,
        is_finished: event.is_finished ?? false,
        is_ongoing: event.is_ongoing ?? false,
    });
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const stripDigits = (value: string) => value.replace(/\d/g, '');
    const capitalizeFirst = (value: string) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = name === 'name' ? stripDigits(value) : value;
        setData(prev => ({ ...prev, [name]: sanitizedValue }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
        evt.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('date', data.date);
        formData.append('start_time', data.start_time);
        formData.append('end_time', data.end_time);
        formData.append('description', data.description);
        formData.append('location', data.location);
        formData.append('is_finished', data.is_finished ? '1' : '0');
        formData.append('is_ongoing', data.is_ongoing ? '1' : '0');
        if (bannerImage) {
            formData.append('banner_image', bannerImage);
        }

        router.put(`/events/${event.id}`, formData, {
            onError: (errors: any) => {
                setErrors(errors);
                setProcessing(false);
            },
            onSuccess: () => {
                setProcessing(false);
            },
        });
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
                <div className="">
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
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (/\d/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                onBlur={() =>
                                    setData((prev) => ({
                                        ...prev,
                                        name: capitalizeFirst(prev.name.trim()),
                                    }))
                                }
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                min={today}
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
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
                                onChange={handleInputChange}
                                className="flex min-h-[96px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            />
                            <InputError message={errors.description} />
                        </div>

                        <div className="grid gap-2 md:col-span-2">
                            <Label htmlFor="banner_image">Banner Image</Label>
                            <input
                                id="banner_image"
                                type="file"
                                name="banner_image"
                                onChange={handleFileChange}
                                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                                className="flex rounded-md border border-input bg-transparent px-3 py-2 text-sm file:border-0 file:bg-blue-600 file:px-3 file:py-1 file:text-sm file:font-medium file:text-white hover:file:bg-blue-700"
                            />
                            <InputError message={errors.banner_image} />
                            <p className="text-xs text-muted-foreground">
                                JPG or PNG only, max 2MB. Leave empty to keep current image.
                            </p>
                            {preview ? (
                                <div className="mt-2 overflow-hidden rounded-md border border-sidebar-border/70 bg-muted/40">
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">New preview:</p>
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="aspect-video w-full object-cover"
                                    />
                                </div>
                            ) : (
                                <div className="mt-2 overflow-hidden rounded-md border border-sidebar-border/70 bg-muted/40">
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">
                                        {event.banner_image ? 'Current image:' : 'Default image:'}
                                    </p>
                                    <img
                                        src={event.banner_image ? `/storage/${event.banner_image}` : defaultBanner}
                                        alt="Current"
                                        className="aspect-video w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="is_finished"
                                checked={data.is_finished}
                                onCheckedChange={(checked) => {
                                    const isFinished = checked === true;
                                    setData(prev => ({ 
                                        ...prev, 
                                        is_finished: isFinished,
                                        is_ongoing: isFinished ? false : prev.is_ongoing
                                    }));
                                }}
                            />
                            <Label htmlFor="is_finished">Mark as Finished</Label>
                        </div>
                        <InputError message={errors.status} />

                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="is_ongoing"
                                checked={data.is_ongoing}
                                onCheckedChange={(checked) => {
                                    const isOngoing = checked === true;
                                    setData(prev => ({ 
                                        ...prev, 
                                        is_ongoing: isOngoing,
                                        is_finished: isOngoing ? false : prev.is_finished
                                    }));
                                }}
                            />
                            <Label htmlFor="is_ongoing">Mark as Ongoing</Label>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                if (confirm(`Delete event "${event.name}"?`)) {
                                    router.delete(`/events/${event.id}`);
                                }
                            }}
                            className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                        >
                            <Trash2 className="h-4 w-4" />
                            Delete Event
                        </button>

                        <div className="flex flex-wrap gap-3">
                            <Link
                                href="/events"
                                className="inline-flex items-center rounded-md border border-sidebar-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                            >
                                Cancel
                            </Link>
                            <Button type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
