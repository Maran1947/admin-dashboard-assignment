import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import axios from 'axios';
import { Button, Pagination, Stack, TextField } from '@mui/material';
import { CloseOutlined, DeleteOutlineOutlined, Done, EditOutlined } from '@mui/icons-material';

const GET_USERS_ENDPOINT = 'https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json';

const headCells = [
    {
        id: 'id',
        numeric: false,
        disablePadding: true,
        label: 'ID',
    },
    {
        id: 'name',
        numeric: false,
        disablePadding: true,
        label: 'Name',
    },
    {
        id: 'email',
        numeric: true,
        disablePadding: false,
        label: 'Email',
    },
    {
        id: 'role',
        numeric: true,
        disablePadding: false,
        label: 'Role',
    },
    {
        id: 'actions',
        numeric: true,
        disablePadding: false,
        label: 'Actions',
    },
];

function EnhancedTableHead(props) {
    const { onSelectAllClick, numSelected, rowCount, } =
        props;

    return (
        <TableHead>
            <TableRow sx={{
                background: '#e9f4f6'
            }} >
                <TableCell >
                    <Checkbox
                        color="primary"
                        indeterminate={numSelected > 0 && numSelected < rowCount}
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            'aria-label': 'select all desserts',
                        }}
                    />
                </TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={'left'}
                    >
                        {headCell.label}
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    rowCount: PropTypes.number.isRequired,
};

function EnhancedTableToolbar(props) {
    const { numSelected, handleDeleteSelectedUsers } = props;

    return (
        <>
            {
                numSelected > 0 &&
                <Toolbar
                    sx={{
                        pl: { sm: 2 },
                        pr: { xs: 1, sm: 1 },
                        ...(numSelected > 0 && {
                            bgcolor: (theme) =>
                                alpha(theme.palette.primary.main, theme.palette.action.activatedOpacity),
                        }),
                    }}
                >
                    {numSelected > 0 && (
                        <Typography
                            sx={{ flex: '1 1 100%' }}
                            color="inherit"
                            variant="subtitle1"
                            component="div"
                        >
                            {numSelected} selected
                        </Typography>
                    )}
                    {numSelected > 0 && (
                        <Button
                            onClick={handleDeleteSelectedUsers}
                            sx={{
                                width: '160px',
                                padding: '10px',
                                background: '#f00',
                                color: '#fff',
                                borderRadius: 2,
                                '&:hover': {
                                    background: '#f00',
                                    opacity: 0.8
                                },
                                textTransform: 'capitalize'
                            }} >
                            Delete Selected
                        </Button>
                    )}
                </Toolbar>
            }
        </>
    );
}

function TablePaginationActions(props) {
    const { 
        count, 
        page, 
        rowsPerPage, 
        onPageChange 
    } = props;

    const handleFirstPageButtonClick = (event) => {
        onPageChange(event, 0);
    };

    const handlePrevButtonClick = (event) => {
        onPageChange(event, page - 1);
    };

    const handleNextButtonClick = (event) => {
        onPageChange(event, page + 1);
    };

    const handleLastPageButtonClick = (event) => {
        onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    };

    const handleAnyPageButtonClick = (event, page) => {
        onPageChange(event, page-1);
    }

    return (
        <Box sx={{ flexShrink: 0, ml: 2.5 }}>
            <Stack direction={'row'} spacing={0.5} alignItems={'center'} >
                <Button
                    className="first-page"
                    onClick={handleFirstPageButtonClick}
                    sx={{
                        padding: '4px 0px',
                        fontSize: '0.8rem',
                        border: '1px solid #808080',
                        color: '#808080'
                    }} variant="outlined">First</Button>
                <Button
                    className="previous-page"
                    onClick={handlePrevButtonClick}
                    sx={{
                        padding: '4px 0px',
                        fontSize: '0.8rem',
                        border: '1px solid #808080',
                        color: '#808080'
                    }}
                    disabled={page + 1 > 1 ? false : true}
                    variant="outlined"
                >Prev</Button>
                <Pagination 
                    page={page+1}
                    count={Math.ceil(count / rowsPerPage)} 
                    onChange={handleAnyPageButtonClick}
                    variant="outlined" 
                    shape="rounded"
                    hideNextButton
                    hidePrevButton />
                <Button
                    className="next-page"
                    onClick={handleNextButtonClick}
                    sx={{
                        padding: '4px 0px',
                        fontSize: '0.8rem',
                        border: '1px solid #808080',
                        color: '#808080'
                    }}
                    variant="outlined"
                    disabled={page + 1 < Math.ceil(count / rowsPerPage) ? false : true} >Next</Button>
                <Button
                    className="last-page"
                    onClick={handleLastPageButtonClick}
                    sx={{
                        padding: '4px 0px',
                        fontSize: '0.8rem',
                        border: '1px solid #808080',
                        color: '#808080'
                    }} variant="outlined">Last</Button>
            </Stack>
        </Box>
    );
}

export default function UsersTable({
    searchValue,
    setSearchValue,
    isFilter,
    setIsFilter
}) {

    const [selected, setSelected] = useState([]);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [paginatedUsers, setPaginatedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editUser, setEditUser] = useState({});

    const handleSelectAllClick = (event) => {
        if (event.target.checked) {
            const newSelected = paginatedUsers.map((user) => user.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event, id) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1),
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event, newPage) => {
        const newUserIndex = newPage * rowsPerPage
        let nextPageUsers = filteredUsers.slice(newUserIndex, newUserIndex + rowsPerPage);

        setPaginatedUsers(nextPageUsers);
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };


    const isSelected = (id) => selected.indexOf(id) !== -1;

    const getUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(GET_USERS_ENDPOINT);
            if (response.status === 200) {
                let allUsers = response.data;

                setPaginatedUsers(allUsers.slice(page, rowsPerPage));
                setUsers(allUsers);
                setFilteredUsers(allUsers);
                setLoading(false);
            }
        } catch (error) {
            console.log(error);
            setLoading(false);
        }
    }

    const handleFilterUsers = () => {
        let newUsers;
        if (searchValue !== '') {
            newUsers = users.filter((user) => {
                let query = searchValue.toLowerCase();
                if (
                    user.name.toLowerCase().includes(query) ||
                    user.email.toLowerCase().includes(query) ||
                    user.role.toLowerCase().includes(query)
                ) {
                    return user;
                }
            });
        } else {
            newUsers = users;
        }

        setPaginatedUsers(newUsers.slice(page, rowsPerPage));
        setFilteredUsers(newUsers);
    }

    const handleSaveUser = () => {
        let newUsers = filteredUsers.map((user) => {
            return user.id === editUser.id ? editUser : user;
        })

        setPaginatedUsers(newUsers.slice(page, rowsPerPage));
        setFilteredUsers(newUsers);
        setEditUser({});
    }

    const handleChangeUserInfo = (e) => {
        console.log(e.target.name, e.target.value);
        setEditUser((user) => {
            return {
                ...user,
                [e.target.name]: e.target.value
            }
        });
    }

    const handleEditUser = (user) => {
        setEditUser(user);
    }

    const handleCancelEdit = () => {
        setEditUser({});
    }

    const handleDeleteUser = (userData) => {
        let newUsers = users.filter((user) => {
            return user.id !== userData.id
        });

        setUsers(newUsers);
        setFilteredUsers(newUsers);
        setPaginatedUsers(newUsers.slice(page, rowsPerPage));
    }

    const handleDeleteSelectedUsers = () => {
        let newUsers = [];

        users.map((user) => {
            let isFound = false;

            selected.map((userId) => {
                if (user.id === userId) {
                    isFound = true
                }
            });

            !isFound && newUsers.push(user);
        });

        setSelected([]);
        setUsers(newUsers);
        setFilteredUsers(newUsers);
        setPaginatedUsers(newUsers.slice(page, rowsPerPage));
    }

    useEffect(() => {
        getUsers();
    }, [])

    useEffect(() => {
        if (isFilter) {
            handleFilterUsers();
            setIsFilter(false);
        }
    }, [isFilter]);

    return (
        <Box sx={{ width: '100%' }}>
            <Paper sx={{ width: '100%', mb: 2 }}>
                <EnhancedTableToolbar
                    numSelected={selected.length}
                    handleDeleteSelectedUsers={handleDeleteSelectedUsers} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 650 }}
                        aria-labelledby="tableTitle"
                        size={'medium'}
                    >
                        <EnhancedTableHead
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                            rowCount={paginatedUsers.length}
                        />
                        <TableBody>
                            {
                                loading ?
                                    <TableRow>
                                        <TableCell>
                                            Loading...
                                        </TableCell>
                                    </TableRow> :
                                    paginatedUsers.length > 0 ?
                                        paginatedUsers.map((row, index) => {

                                            const isItemSelected = isSelected(row.id);
                                            const labelId = `enhanced-table-checkbox-${index}`;

                                            return (
                                                editUser.id === row.id ?
                                                    <TableRow
                                                        hover
                                                        role="checkbox"
                                                        aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        key={row.id}
                                                        selected={isItemSelected}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            background: isItemSelected ? '#e4e4e4!important' : '#fff'
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                color="primary"
                                                                onChange={(event) => handleClick(event, row.id)}
                                                                checked={isItemSelected}
                                                                inputProps={{
                                                                    'aria-labelledby': labelId,
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                        >
                                                            {row.id}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                        >
                                                            <TextField
                                                                defaultValue={row.name}
                                                                onChange={handleChangeUserInfo}
                                                                id="edit-row-name"
                                                                name="name"
                                                                hiddenLabel
                                                                variant="outlined" />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <TextField
                                                                defaultValue={row.email}
                                                                onChange={handleChangeUserInfo}
                                                                type='email'
                                                                id="edit-row-email"
                                                                name="email"
                                                                hiddenLabel
                                                                variant="outlined" />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <TextField
                                                                defaultValue={row.role}
                                                                onChange={handleChangeUserInfo}
                                                                id="edit-row-role"
                                                                name="role"
                                                                hiddenLabel
                                                                variant="outlined" />
                                                        </TableCell>
                                                        <TableCell align="left">
                                                            <Button
                                                                className="cancel"
                                                                onClick={handleCancelEdit}
                                                                sx={{
                                                                    minWidth: '48px!important',
                                                                    background: '#fff',
                                                                    padding: '6px',
                                                                    boxShadow: '0px 0px 1px #808080',
                                                                    mr: 2
                                                                }} >
                                                                <CloseOutlined sx={{
                                                                    color: '#808080'
                                                                }} />
                                                            </Button>
                                                            <Button
                                                                className="save"
                                                                onClick={handleSaveUser}
                                                                sx={{
                                                                    minWidth: '48px!important',
                                                                    background: '#fff',
                                                                    padding: '6px',
                                                                    boxShadow: '0px 0px 1px #808080'
                                                                }} >
                                                                <Done sx={{
                                                                    color: '#00f'
                                                                }} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow> :
                                                    <TableRow
                                                        hover
                                                        role="checkbox"
                                                        aria-checked={isItemSelected}
                                                        tabIndex={-1}
                                                        key={row.id}
                                                        selected={isItemSelected}
                                                        sx={{
                                                            cursor: 'pointer',
                                                            background: isItemSelected ? '#e4e4e4!important' : '#fff'
                                                        }}
                                                    >
                                                        <TableCell>
                                                            <Checkbox
                                                                color="primary"
                                                                onChange={(event) => handleClick(event, row.id)}
                                                                checked={isItemSelected}
                                                                inputProps={{
                                                                    'aria-labelledby': labelId,
                                                                }}
                                                            />
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                        >
                                                            {row.id}
                                                        </TableCell>
                                                        <TableCell
                                                            component="th"
                                                            id={labelId}
                                                            scope="row"
                                                        >
                                                            {row.name}
                                                        </TableCell>
                                                        <TableCell align="left">{row.email}</TableCell>
                                                        <TableCell align="left">{row.role}</TableCell>
                                                        <TableCell align="left">
                                                            <Button
                                                                className="edit"
                                                                onClick={() => handleEditUser(row)}
                                                                sx={{
                                                                    minWidth: '48px!important',
                                                                    background: '#fff',
                                                                    padding: '6px',
                                                                    boxShadow: '0px 0px 1px #808080',
                                                                    mr: 2
                                                                }} >
                                                                <EditOutlined sx={{
                                                                    color: '#808080'
                                                                }} />
                                                            </Button>
                                                            <Button
                                                                className="delete"
                                                                onClick={() => handleDeleteUser(row)}
                                                                sx={{
                                                                    minWidth: '48px!important',
                                                                    background: '#fff',
                                                                    padding: '6px',
                                                                    boxShadow: '0px 0px 1px #808080'
                                                                }} >
                                                                <DeleteOutlineOutlined sx={{
                                                                    color: '#f00'
                                                                }} />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                            );
                                        }) :
                                        <TableRow>
                                            <TableCell id='No data found'>
                                                No data found.
                                            </TableCell>
                                        </TableRow>
                            }
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[10]}
                    component="div"
                    count={filteredUsers.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                />
            </Paper>
        </Box>
    );
}
