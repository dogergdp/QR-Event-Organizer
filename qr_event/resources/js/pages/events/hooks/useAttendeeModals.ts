import { useState, useCallback } from 'react';
import type { EditablePlusOne } from '../types/modal-states';

export const useAttendeeModals = () => {
    // Plus Ones Modal State
    const [selectedAttendee, setSelectedAttendee] = useState<any | null>(null);
    const [editablePlusOnes, setEditablePlusOnes] = useState<EditablePlusOne[]>([]);
    const [savingPlusOnes, setSavingPlusOnes] = useState(false);

    // Payment Modal State
    const [paymentModalAttendee, setPaymentModalAttendee] = useState<any | null>(null);
    const [paymentIsPaid, setPaymentIsPaid] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('0');
    const [paymentType, setPaymentType] = useState('');
    const [paymentRemarks, setPaymentRemarks] = useState('');

    // Attendance Modal State
    const [attendanceModalAttendee, setAttendanceModalAttendee] = useState<any | null>(null);
    const [newAttendanceStatus, setNewAttendanceStatus] = useState(false);
    const [selectedPlusOnes, setSelectedPlusOnes] = useState<string[]>([]);
    const [savingAttendance, setSavingAttendance] = useState(false);

    // Color Modal State
    const [colorModalAttendee, setColorModalAttendee] = useState<any | null>(null);
    const [familyColor, setFamilyColor] = useState('');

    // Add/Import Modals
    const [addAttendeeModalOpen, setAddAttendeeModalOpen] = useState(false);
    const [importFamiliesModalOpen, setImportFamiliesModalOpen] = useState(false);

    // Family expansion state
    const [expandedFamilies, setExpandedFamilies] = useState<Set<number>>(new Set());

    const toggleFamily = useCallback((attendeeId: number) => {
        setExpandedFamilies((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(attendeeId)) {
                newSet.delete(attendeeId);
            } else {
                newSet.add(attendeeId);
            }
            return newSet;
        });
    }, []);

    const openAttendeeModal = useCallback((attendee: any) => {
        setSelectedAttendee(attendee);
        setEditablePlusOnes(
            (attendee.plus_ones ?? []).map((plusOne: any, index: number) => ({
                id: plusOne.id ?? `plus-one-${index}`,
                full_name: plusOne.full_name ?? '',
                age: plusOne.age,
                gender: plusOne.gender ?? '',
                is_first_time: !!plusOne.is_first_time,
                remarks: plusOne.remarks ?? '',
                is_attended: !!plusOne.is_attended,
            })),
        );
    }, []);

    const closeAttendeeModal = useCallback(() => {
        setSelectedAttendee(null);
        setEditablePlusOnes([]);
    }, []);

    const openPaymentModal = useCallback((attendee: any) => {
        setPaymentModalAttendee(attendee);
        setPaymentIsPaid(attendee.is_paid);
        setPaymentAmount(attendee.amount_paid ?? '0');
        setPaymentType(attendee.payment_type ?? '');
        setPaymentRemarks(attendee.payment_remarks ?? '');
    }, []);

    const closePaymentModal = useCallback(() => {
        setPaymentModalAttendee(null);
        setPaymentIsPaid(false);
        setPaymentAmount('0');
        setPaymentType('');
        setPaymentRemarks('');
    }, []);

    const openAttendanceModal = useCallback((attendee: any) => {
        setAttendanceModalAttendee(attendee);
        setNewAttendanceStatus(attendee.is_attended);
        setSelectedPlusOnes(
            (attendee.plus_ones ?? [])
                .filter((plusOne: any) => plusOne.id && plusOne.is_attended)
                .map((plusOne: any) => String(plusOne.id)),
        );
    }, []);

    const closeAttendanceModal = useCallback(() => {
        setAttendanceModalAttendee(null);
        setNewAttendanceStatus(false);
        setSelectedPlusOnes([]);
    }, []);

    const openFamilyColorModal = useCallback((attendee: any) => {
        setColorModalAttendee(attendee);
        setFamilyColor(String(attendee.assigned_values?.family_color ?? 'none'));
    }, []);

    const closeFamilyColorModal = useCallback(() => {
        setColorModalAttendee(null);
        setFamilyColor('');
    }, []);

    const updatePlusOneField = useCallback(
        (index: number, field: keyof EditablePlusOne, value: any) => {
            setEditablePlusOnes((prev) =>
                prev.map((plusOne, currentIndex) =>
                    currentIndex === index ? { ...plusOne, [field]: value } : plusOne,
                ),
            );
        },
        [],
    );

    const addPlusOneRow = useCallback(() => {
        setEditablePlusOnes((prev) => [
            ...prev,
            {
                id: `plus-one-${Date.now()}`,
                full_name: '',
                age: undefined,
                gender: '',
                is_first_time: false,
                remarks: '',
                is_attended: selectedAttendee?.is_attended ?? false,
            },
        ]);
    }, [selectedAttendee?.is_attended]);

    const removePlusOneRow = useCallback((index: number) => {
        setEditablePlusOnes((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
    }, []);

    return {
        // Plus Ones Modal
        selectedAttendee,
        editablePlusOnes,
        savingPlusOnes,
        setSelectedAttendee,
        setEditablePlusOnes,
        setSavingPlusOnes,
        openAttendeeModal,
        closeAttendeeModal,
        updatePlusOneField,
        addPlusOneRow,
        removePlusOneRow,
        // Payment Modal
        paymentModalAttendee,
        paymentIsPaid,
        paymentAmount,
        paymentType,
        paymentRemarks,
        setPaymentIsPaid,
        setPaymentAmount,
        setPaymentType,
        setPaymentRemarks,
        openPaymentModal,
        closePaymentModal,
        // Attendance Modal
        attendanceModalAttendee,
        newAttendanceStatus,
        selectedPlusOnes,
        savingAttendance,
        setNewAttendanceStatus,
        setSelectedPlusOnes,
        setSavingAttendance,
        openAttendanceModal,
        closeAttendanceModal,
        // Color Modal
        colorModalAttendee,
        familyColor,
        setFamilyColor,
        openFamilyColorModal,
        closeFamilyColorModal,
        // Add/Import Modals
        addAttendeeModalOpen,
        setAddAttendeeModalOpen,
        importFamiliesModalOpen,
        setImportFamiliesModalOpen,
        // Expanded families
        expandedFamilies,
        toggleFamily,
    };
};
