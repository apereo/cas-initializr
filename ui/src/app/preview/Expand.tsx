import { ArrowDropDown, ArrowRight } from "@mui/icons-material";

export function Expand ({status}: {status: boolean}) {
    return (status ? <ArrowDropDown /> : <ArrowRight />)
}