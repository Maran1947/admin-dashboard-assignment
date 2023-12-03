import { FormControl, IconButton, InputAdornment, OutlinedInput, Stack } from "@mui/material";
import TextField from '@mui/material/TextField';
import SearchIcon from '@mui/icons-material/Search';
import { Button } from "@mui/base";

export default function SearchInput(props) {

    const {searchValue, setSearchValue, setIsFilter} = props;

    const handleSearchInput = (e) => {
        setSearchValue(e.target.value);
    } 

    const handleSearchIcon = () => {
        setIsFilter(true);
    }

    const handleOnPressEnter = (e) => {
        if(e.key === "Enter") {
            handleSearchIcon();
        }
    }

    const handleSearchIconDownPassword = (event) => {
        event.preventDefault();
    };

    return (
        <Stack direction={'row'}
            alignItems={'center'} >
            <FormControl sx={{ m: 1, width: '25ch' }} variant="outlined">
                <OutlinedInput
                    id="outlined-search-input"
                    type={'text'}
                    value={searchValue}
                    onChange={handleSearchInput}
                    onKeyDown={handleOnPressEnter}
                    endAdornment={
                        <InputAdornment position="end">
                            <IconButton
                                className="search-icon"
                                aria-label="Search Icon"
                                onClick={handleSearchIcon}
                                onMouseDown={handleSearchIconDownPassword}
                                edge="end"
                            >
                                <SearchIcon className="search-icon" />
                            </IconButton>
                        </InputAdornment>
                    }
                    placeholder="Search"
                />
            </FormControl>
        </Stack>
    )
}