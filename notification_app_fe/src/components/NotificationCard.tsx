'use client';

import React from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import WorkOutlinedIcon from '@mui/icons-material/WorkOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import { Notification } from '@/lib/api';
import { useViewed } from '@/lib/viewedContext';

const TYPE_CONFIG = {
    Placement: { color: '#0284C7', bg: '#F0F9FF', icon: <WorkOutlinedIcon sx={{ fontSize: 16 }} /> },
    Result: { color: '#059669', bg: '#ECFDF5', icon: <SchoolOutlinedIcon sx={{ fontSize: 16 }} /> },
    Event: { color: '#D97706', bg: '#FFFBEB', icon: <EventOutlinedIcon sx={{ fontSize: 16 }} /> },
};

interface Props {
    notification: Notification;
    priority?: boolean;
}

export default function NotificationCard({ notification, priority = false }: Props) {
    const { viewed, markViewed } = useViewed();
    const isNew = !viewed.has(notification.ID);
    const cfg = TYPE_CONFIG[notification.Type] || TYPE_CONFIG.Event;

    const handleClick = () => {
        if (isNew) markViewed(notification.ID);
    };

    return (
        <Paper
            onClick={handleClick}
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                cursor: 'pointer',
                border: '1px solid',
                borderColor: isNew ? '#E5E7EB' : '#F3F4F6',
                bgcolor: isNew ? '#FFFFFF' : '#F9FAFB',
                transition: 'all 0.2s ease',
                position: 'relative',
                '&:hover': { 
                    borderColor: '#D1D5DB',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                },
            }}
        >
            {isNew && (
                <Box sx={{ 
                    position: 'absolute', 
                    top: 16, 
                    right: 16, 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5 
                }}>
                    <FiberNewIcon sx={{ color: '#EF4444', fontSize: 20 }} />
                </Box>
            )}

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                        icon={cfg.icon}
                        label={notification.Type}
                        size="small"
                        sx={{ 
                            bgcolor: cfg.bg, 
                            color: cfg.color, 
                            fontWeight: 600, 
                            fontSize: '0.75rem',
                            height: 24,
                            border: `1px solid ${cfg.color}30`
                        }}
                    />
                    {priority && (
                        <Chip 
                            label="Priority" 
                            size="small" 
                            sx={{ 
                                bgcolor: '#FEF2F2',
                                color: '#EF4444',
                                border: '1px solid #FECACA',
                                fontSize: '0.7rem', 
                                fontWeight: 600,
                                height: 24,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em'
                            }} 
                        />
                    )}
                </Box>
                
                <Typography 
                    variant="body1" 
                    sx={{ 
                        color: isNew ? '#111827' : '#4B5563', 
                        fontWeight: isNew ? 600 : 400,
                        fontSize: '1rem',
                        lineHeight: 1.5,
                        pr: 4
                    }}
                >
                    {notification.Message}
                </Typography>
                
                <Typography 
                    variant="body2" 
                    sx={{ 
                        color: '#9CA3AF', 
                        fontWeight: 400,
                        fontSize: '0.85rem'
                    }}
                >
                    {new Date(notification.Timestamp).toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                    })}
                </Typography>
            </Box>
        </Paper>
    );
}
