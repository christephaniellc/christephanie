import React from "react";
import { Typography, Link } from "@mui/material";
import { useTranslation } from "react-i18next";

const About: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div>
            <Typography variant="h3" gutterBottom>
                {t("welcomeTitle")}
            </Typography>
            <Typography variant="body1" paragraph>
                {t("welcomeDescription")}
            </Typography>

            {/* Contact Us Section */}
            <Typography variant="h4" gutterBottom>
                {t("contactUs.title")}
            </Typography>
            <Typography variant="body1" paragraph>
                {t("contactUs.description")}
            </Typography>
            <Typography variant="body1">
                <Link href={`mailto:${t("contactUs.topherEmail")}`} target="_blank" rel="noopener noreferrer">
                    {t("contactUs.topherEmail")}
                </Link>
            </Typography>
            <Typography variant="body1" paragraph>
                <Link href={`mailto:${t("contactUs.mindaEmail")}`} target="_blank" rel="noopener noreferrer">
                    {t("contactUs.mindaEmail")}
                </Link>
            </Typography>
        </div>
    );
};

export default About;
