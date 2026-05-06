'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
    Box, Container, Typography, Stack, CircularProgress, Alert,
    AppBar, Toolbar, Button, Slider, Paper
} from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import Link from 'next/link';
import NotificationCard from '@/components/NotificationCard';
import { fetchPriorityNotifications, Notification } from '@/lib/api';

export default function PriorityPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [sliderValue, setSliderValue] = useState(10);
    const [fetchValue, setFetchValue] = useState(10);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchPriorityNotifications(fetchValue);
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error('Priority load failed:', err);
            setError('Failed to load priority notifications. Please check the backend connection.');
        } finally {
            setLoading(false);
        }
    }, [fetchValue]);

    useEffect(() => {
        const trigger = async () => {
            await load();
        };
        trigger();
    }, [load]);

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
                                <InboxOutlinedIcon fontSize="small" sx={{ color: '#4B5563' }} />
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
                                Priority Inbox
                            </Typography>
                        </Box>
                        <Button
                            component={Link}
                            href="/"
                            startIcon={<NotificationsOutlinedIcon />}
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
                            All Notifications
                        </Button>
                    </Toolbar>
                </Container>
            </AppBar>

            <Container maxWidth="md" sx={{ py: 8 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 5 }}>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
                        Priority Intelligence
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#6B7280' }}>
                        AI-curated notifications ranked by strategic importance and recency.
                    </Typography>
                </Box>

                <Paper elevation={0} sx={{ p: 4, mb: 5, border: '1px solid #E5E7EB', borderRadius: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2" sx={{ color: '#4B5563', fontWeight: 600 }}>
                            Display Depth
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>
                            Top {sliderValue}
                        </Typography>
                    </Box>
                    <Slider
                        value={sliderValue}
                        min={5}
                        max={10}
                        step={1}
                        marks={[
                            { value: 5, label: '5' },
                            { value: 10, label: '10' },
                        ]}
                        onChange={(_, val) => setSliderValue(val as number)}
                        onChangeCommitted={(_, val) => setFetchValue(val as number)}
                        sx={{ 
                            color: '#111827',
                            '& .MuiSlider-thumb': {
                                width: 20,
                                height: 20,
                                backgroundColor: '#FFFFFF',
                                border: '2px solid #111827',
                                '&:hover': { boxShadow: '0 0 0 8px rgba(17, 24, 39, 0.1)' }
                            },
                            '& .MuiSlider-rail': { opacity: 0.2, backgroundColor: '#6B7280' },
                        }}
                    />
                </Paper>

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
                                    No priority intelligence found.
                                </Typography>
                            </Paper>
                        ) : (
                            notifications.map((n, i) => (
                                <Box key={n.ID} sx={{ display: 'flex', alignItems: 'stretch', gap: 2 }}>
                                    <Box sx={{
                                        width: 32,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: '#9CA3AF',
                                        fontWeight: 600,
                                        fontSize: '0.875rem'
                                    }}>
                                        #{i + 1}
                                    </Box>
                                    <Box sx={{ flex: 1 }}>
                                        <NotificationCard notification={n} priority />
                                    </Box>
                                </Box>
                            ))
                        )}
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
