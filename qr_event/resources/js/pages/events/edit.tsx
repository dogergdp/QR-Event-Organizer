import { Head, router } from '@inertiajs/react';
import React, { useState } from 'react';
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
    const [data, setData] = useState({
        name: event.name,
        date: event.date,
        start_time: event.start_time ?? '',
        end_time: event.end_time ?? '',
        description: event.description,
        location: event.location,
        is_finished: event.is_finished ?? false,
    });
    const [bannerImage, setBannerImage] = useState<File | null>(null);
    const [preview, setPreview] = useState<string>('');
    const [processing, setProcessing] = useState(false);
    const [errors, setErrors] = useState<any>({});

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setData(prev => ({ ...prev, [name]: value }));
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
                                required
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
                                <div className="mt-2 overflow-hidden rounded-md border border-sidebar-border/70">
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">New preview:</p>
                                    <img src={preview} alt="Preview" className="h-32 w-full object-cover" />
                                </div>
                            ) : event.banner_image ? (
                                <div className="mt-2 overflow-hidden rounded-md border border-sidebar-border/70">
                                    <p className="mb-1 text-xs font-medium text-muted-foreground">Current image:</p>
                                    <img src={`/storage/${event.banner_image}`} alt="Current" className="h-32 w-full object-cover" />
                                </div>
                            ) : null}
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
