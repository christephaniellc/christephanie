import Typography from '@mui/material/Typography';

import Meta from '@/components/Meta';
import { FullSizeCenteredFlexBox } from '@/components/styled';

function SaveTheDatePage() {
  return (
    <>
      <Meta title="Save the Date!" />
      <FullSizeCenteredFlexBox>
        <Typography variant="h3">Save the Date!</Typography>
      </FullSizeCenteredFlexBox>
    </>
  );
}

export default SaveTheDatePage;
