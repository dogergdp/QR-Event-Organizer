import { Head, Link, router } from '@inertiajs/react';
import React, { useState } from 'react';
import AppLayout from '@/layouts/app-layout';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Create Event',
        href: '/events/create',
    },
];

export default function CreateEvent() {
    const today = new Date().toISOString().split('T')[0];
    const [data, setData] = useState({
        name: '',
        date: '',
        start_time: '',
        end_time: '',
        description: '',
        location: '',
        is_finished: false,
        is_ongoing: false,
    });
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const stripDigits = (value: string) => value.replace(/\d/g, '');
    const capitalizeFirst = (value: string) =>
        value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setBannerImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        const sanitizedValue = name === 'name' ? stripDigits(value) : value;
        setData(prev => ({ ...prev, [name]: sanitizedValue }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setProcessing(true);
        setErrors({});

        const formData = new FormData();
        formData.append('name', data.name);
        formData.append('date', data.date);
        formData.append('start_time', data.start_time);
        formData.append('end_time', data.end_time);
        formData.append('description', data.description);
        formData.append('location', data.location);
        if (bannerImage) {
            formData.append('banner_image', bannerImage);
        }
        if (data.is_finished) {
            formData.append('is_finished', '1');
        }
        if (data.is_ongoing) {
            formData.append('is_ongoing', '1');
        }

        router.post('/events', formData, {
            onSuccess: () => {
                setData({
                    name: '',
                    date: '',
                    start_time: '',
                    end_time: '',
                    description: '',
                    location: '',
                    is_finished: false,
                    is_ongoing: false,
                });
                setBannerImage(null);
                setPreview('');
                setProcessing(false);
            },
            onError: (errors: any) => {
                setErrors(errors);
                setProcessing(false);
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Event" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="rounded-xl border border-sidebar-border/70 bg-background p-4">
                    <h1 className="text-xl font-semibold text-foreground">
                        Create Event
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Admin-only page for creating events.
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
                                placeholder="Sunday Service"
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
                                placeholder="Main Hall"
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
                                placeholder="Event description"
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
                                JPG or PNG only, max 2MB. Optional - default banner will be used if empty.
                            </p>
                            {preview && (
                                <div className="mt-2 overflow-hidden rounded-md border border-sidebar-border/70 bg-muted/40">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="aspect-video w-full object-cover"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="is_finished"
                                checked={data.is_finished}
                                onCheckedChange={(checked) =>
                                    setData(prev => ({ ...prev, is_finished: checked === true }))
                                }
                            />
                            <Label htmlFor="is_finished">Mark as finished</Label>
                        </div>

                        <div className="flex items-center gap-2 md:col-span-2">
                            <Checkbox
                                id="is_ongoing"
                                checked={data.is_ongoing}
                                onCheckedChange={(checked) =>
                                    setData(prev => ({ ...prev, is_ongoing: checked === true }))
                                }
                            />
                            <Label htmlFor="is_ongoing">Mark as ongoing</Label>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap justify-end gap-3">
                        <Link
                            href="/events"
                            className="inline-flex items-center rounded-md border border-sidebar-border/70 px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                        >
                            Cancel
                        </Link>
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Saving...' : 'Create Event'}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
