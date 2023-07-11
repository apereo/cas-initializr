import React, { Fragment } from 'react';
import Popover from '@mui/material/Popover';
import { Box, IconButton } from '@mui/material';

export interface ButtonPopoverProps {
    children: any;
    icon: any;
    label: string;
    onClick: () => void;
}

export default function ButtonPopover({ children, icon, label, onClick }: ButtonPopoverProps) {

    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);

    const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);
    const id = open ? 'button-popover' : undefined;

    return (
        <Fragment>
            <IconButton aria-label={ label }
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onClick={ onClick }
                >
            { icon }
            </IconButton>
            <Popover
                id={id}
                open={open}
                disableRestoreFocus
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'center',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'center',
                    horizontal: 'right',
                }}
                sx={{
                    pointerEvents: 'none',
                }}
            >
            <Box sx={ { padding: '1rem', backgroundColor: 'black', fontSize: '0.9rem' } }>
                {label}
                <hr />
                { children }
            </Box>
            </Popover>
        </Fragment>
    );
}