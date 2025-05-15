import { useState } from 'react';
import {
    Drawer,
    Box,
    Typography,
    Button,
    List,
    ListItem,
    ListItemText,
} from '@mui/material';
import Autocomplete from '@mui/joy/Autocomplete';
import Input from '@mui/joy/Input';
import Checkbox from '@mui/joy/Checkbox';
export default function SlideOutDrawer() {
    const [open, setOpen] = useState(false);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant='h5'>📚 MyPack Helper</Typography>
            <Button onClick={() => setOpen(true)}>Open Drawer</Button>

            <Drawer anchor='right' open={open} onClose={() => setOpen(false)}>
                <Box sx={{ width: 250, p: 2 }}>
                    <Typography variant='h6'>Slide-Out Panel</Typography>
                    <List>
                        <Checkbox label="GEP Requirements" defaultChecked />
                        <Autocomplete multiple limitTags={3} options={['Major 1', 'Major 2']} />
                        <Autocomplete options={['Minor 1', 'Minor 2']} />
                        <Autocomplete options={['Starttime 1', 'Starttime 2']} ></Autocomplete>
                        <Autocomplete options={['Endtime 1', 'Endtime 2']} />
                        <Button variant='outlined' sx={{ width: '100%' }}>Search</Button>
                        <ListItem>
                            <ListItemText primary='Item 1' />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary='Item 2' />
                        </ListItem>
                    </List>
                    <Button onClick={() => setOpen(false)}>Close</Button>
                </Box>
            </Drawer>
        </Box>
    );
}
