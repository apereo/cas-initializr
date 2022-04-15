import { FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import React from "react";

const versions = [
    '6.5.x',
    '6.4.x',
    '6.3.x',
    '6.2.x',
    '6.1.x',
    '6.0.x'
];

export default function Initializr() {

    const handleChange = (e:SelectChangeEvent<string>) => setVersion(e.target.value);

    const [version, setVersion] = React.useState('6.5.x');

    return (
        <FormControl fullWidth>
            <InputLabel id="demo-simple-select-label">Version</InputLabel>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={version}
                label="Version"
                onChange={handleChange}
            >
                {versions.map((v) => (
                    <MenuItem key={v} value={v}>{v}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
