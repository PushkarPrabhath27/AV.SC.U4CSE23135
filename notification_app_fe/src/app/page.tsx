'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Container, Typography, ToggleButtonGroup, ToggleButton,
    Stack, CircularProgress, Alert, Pagination, AppBar, Toolbar, Button,
    Paper, Chip
} from '@mui/material';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Link from 'next/link';
import NotificationCard from '@/components/NotificationCard';
import { fetchNotifications, Notification } from '@/lib/api';

const FILTERS = ['All', 'Placement', 'Result', 'Event'] as const;
type Filter = typeof FILTERS[number];
const PAGE_LIMIT = 10;

export default function AllNotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [filter, setFilter] = useState<Filter>('All');
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [totalPages, setTotalPages] = useState(1);

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchNotifications(page, PAGE_LIMIT, filter === 'All' ? undefined : filter);
            setNotifications(data.notifications || []);
            setTotalPages(Math.max(1, Math.ceil((data.notifications?.length || 0) / PAGE_LIMIT)));
        } catch {
            setError('Failed to load notifications. Please check the backend connection.');
        } finally {
            setLoading(false);
        }
    }, [page, filter]);

    useEffect(() => {
        const trigger = async () => {
            await load();
        };
        trigger();
    }, [load]);

    const handleFilter = (_: React.MouseEvent<HTMLElement>, val: Filter | null) => {
        if (val) {
            setFilter(val);
            setPage(1);
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB' }}>
            <AppBar 
                position="sticky" 
                elevation={0} 
                sx={{ 
                    bgcolor: '#FFFFFF', 
                    borderBottom: '1px solid #E5E7EB',
                    color: '#111827'
                }}
            >
                <Container maxWidth="lg">
                    <Toolbar disableGutters sx={{ minHeight: '64px', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ 
                                bgcolor: '#F3F4F6', 
                                p: 1, 
                                borderRadius: 2, 
                                display: 'flex',
                                border: '1px solid #E5E7EB'
                            }}>
                                <NotificationsOutlinedIcon fontSize="small" sx={{ color: '#4B5563' }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                Campus Network
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            href="/priority"
                            startIcon={<InboxOutlinedIcon />}
                            sx={{ 
                                color: '#4B5563',
                                textTransform: 'none',
                                fontWeight: 500,
                                px: 2,
                                py: 1,
                                borderRadius: 2,
                                '&:hover': { bgcolor: '#F3F4F6', color: '#111827' }
                            }}
                        >
                            Priority Inbox
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                        Notifications
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>
                        Stay updated with the latest placements, results, and events on campus.
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <ToggleButtonGroup
                        value={filter}
                        exclusive
                        onChange={handleFilter}
                        sx={{ 
                            gap: 1,
                            '& .MuiToggleButtonGroup-grouped': {
                                border: '1px solid #E5E7EB !important',
                                borderRadius: '8px !important',
                                px: 2,
                                py: 0.75,
                                textTransform: 'none',
                                fontWeight: 500,
                                color: '#4B5563',
                                bgcolor: '#FFFFFF',
                                '&.Mui-selected': {
                                    bgcolor: '#111827 !important',
                                    color: '#FFFFFF !important',
                                    border: '1px solid #111827 !important',
                                },
                                '&:hover': {
                                    bgcolor: '#F3F4F6',
                                }
                            }
                        }}
                    >
                        {FILTERS.map((f) => (
                            <ToggleButton key={f} value={f} disableRipple>
                                {f}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                        <CircularProgress size={32} sx={{ color: '#9CA3AF' }} />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
                ) : (
                    <Stack spacing={2}>
                        {notifications.length === 0 ? (
                            <Paper elevation={0} sx={{ p: 8, textAlign: 'center', border: '1px dashed #D1D5DB', bgcolor: '#F9FAFB', borderRadius: 3 }}>
                                <Typography sx={{ color: '#6B7280', fontWeight: 500 }}>
                                    No notifications found for this category.
                                </Typography>
                            </Paper>
                        ) : (
                            notifications.map((n) => (
                                <NotificationCard key={n.ID} notification={n} />
                            ))
                        )}
                    </Stack>
                )}

                {totalPages > 1 && !loading && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(_, val) => setPage(val)}
                            shape="rounded"
                            sx={{
                                '& .MuiPaginationItem-root': { fontWeight: 500, color: '#4B5563' },
                                '& .Mui-selected': { bgcolor: '#F3F4F6 !important', color: '#111827' }
                            }}
                        />
                    </Box>
                )}
            </Container>
        </Box>
    );
}
