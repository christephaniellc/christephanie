import React, { useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AnnouncementIcon from "@mui/icons-material/Announcement";
import InfoIcon from "@mui/icons-material/Info";
import LinkIcon from "@mui/icons-material/Link";

function Nav() {
    const [value, setValue] = useState<number>(0);

    return (
        <BottomNavigation
            value={value}
            onChange={(event, newValue: number) => {
                setValue(newValue);
            }}
            showLabels
        >
            <BottomNavigationAction label="Account" icon={<AccountBoxIcon />} />
            <BottomNavigationAction label="News" icon={<AnnouncementIcon />} />
            <BottomNavigationAction label="About" icon={<InfoIcon />} />
            <BottomNavigationAction label="External Links" icon={<LinkIcon />} />
        </BottomNavigation>
    );
}

export default Nav;
