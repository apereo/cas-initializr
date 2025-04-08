import ArrowDropDown from "@mui/icons-material/ArrowDropDown";
import ArrowRight from "@mui/icons-material/ArrowRight";

export function Expand ({status}: {status: boolean}) {
    return (status ? <ArrowDropDown /> : <ArrowRight />)
}
