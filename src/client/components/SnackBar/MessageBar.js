import React, { useEffect, useState } from 'react'
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';
import { updateSnackbar } from '../../_redux/SnackbarSlice';
import { useDispatch } from 'react-redux'

const Alert = React.forwardRef(function Alert(props, ref) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const MessageBar = ({ type, message }) => {
    const [open, setOpen] = useState(false);
    const snackbarObj = { type: type, message: message };

    const dispatch = useDispatch()

    const handleClose = () => {
        setOpen(false)
    };

    useEffect(() => {
        if (message !== '') {
            setOpen(true);
            setTimeout(() => { setOpen(false); dispatch(updateSnackbar({ type: type, message: '' })); }, 3000)
        }
    }, [dispatch, type, message])


    return (
        <>
            {snackbarObj.message !== '' ?
                <Stack spacing={2} style={{ width: "400px", position: "absolute", zIndex: "9999999", bottom: "40px", left: "30px" }}>
                    <Snackbar open={open} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: 'right' }}>
                        <Alert severity={snackbarObj.type}>
                            {snackbarObj.message}
                        </Alert>
                    </Snackbar>
                </Stack>
                : ''}
        </>
    )
}

export default MessageBar;