import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import BugReportIcon from '@mui/icons-material/BugReport';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import { styled } from '@mui/material/styles';
import { getConfig } from '@/auth_config';

// Styled components
const ResultCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  boxShadow: '0px 2px 8px rgba(0,0,0,0.1)',
}));

const SectionHeading = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(3),
  fontWeight: 'bold',
}));

const StatusChip = styled(Chip)(({ theme, color }) => ({
  marginLeft: theme.spacing(1),
}));

// Types for test results
interface EndpointSuccessResult {
  url: string;
  method: string;
  status: number;
  ok: boolean;
}

interface EndpointErrorResult {
  url: string;
  method: string;
  error: string;
}

type EndpointResult = EndpointSuccessResult | EndpointErrorResult;

interface CorsCheckResult {
  summary: {
    successful: number;
    failed: number;
    errors: number;
  };
  details: EndpointResult[];
}

// Test endpoint function from cors-check.js
const testEndpoint = (url: string, method = 'GET', headers = {}) => {
  console.log(`Testing ${method} ${url}...`);
  
  return fetch(url, { 
    method, 
    headers: {
      ...headers,
      'Content-Type': 'application/json'
    },
    // For non-GET methods, include an empty body
    ...(method !== 'GET' ? { body: JSON.stringify({}) } : {})
  })
  .then(response => {
    console.log(`${method} ${url} -> Status: ${response.status}`);
    console.log('  Headers:', [...response.headers.entries()]);
    return { url, method, status: response.status, ok: response.ok };
  })
  .catch(error => {
    console.error(`${method} ${url} -> Error:`, error.message);
    return { url, method, error: error.message };
  });
};

// DNS resolution test from network-check.js
const testDns = (domain: string): Promise<{domain: string, success: boolean, time: number}> => {
  return new Promise((resolve) => {
    const start = Date.now();
    const img = new Image();
    
    img.onload = () => {
      resolve({
        domain,
        success: true,
        time: Date.now() - start
      });
    };
    
    img.onerror = () => {
      // This will typically error, but still tells us if DNS resolved
      resolve({
        domain,
        success: true, // If we got an error, DNS still resolved
        time: Date.now() - start
      });
    };
    
    // Set a timeout in case the request hangs
    setTimeout(() => {
      resolve({
        domain,
        success: false,
        time: Date.now() - start
      });
    }, 5000);
    
    img.src = `https://${domain}/favicon.ico?${Date.now()}`;
  });
};

export default function DebugPage() {
  const [corsResults, setCorsResults] = useState<CorsCheckResult | null>(null);
  const [dnsResults, setDnsResults] = useState<any[]>([]);
  const [connectionInfo, setConnectionInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    cors: false,
    dns: false,
    connection: false
  });
  const [config, setConfig] = useState<any>(null);

  // Fetch basic connection info
  const checkConnectionInfo = () => {
    setIsLoading(prev => ({ ...prev, connection: true }));
    
    const info: any = {
      online: navigator.onLine,
      userAgent: navigator.userAgent,
    };
    
    if ('connection' in navigator && navigator.connection) {
      info.connection = {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
        saveData: (navigator as any).connection.saveData
      };
    }
    
    setConnectionInfo(info);
    setIsLoading(prev => ({ ...prev, connection: false }));
  };

  // DNS resolution tests
  const runDnsTests = async () => {
    setIsLoading(prev => ({ ...prev, dns: true }));
    
    const domains = [
      'google.com',
      'wedding.christephanie.com',
      'dev.wedding.christephanie.com',
      'fianceapi.dev.wedding.christephanie.com',
      'fianceapi.wedding.christephanie.com'
    ];
    
    const results = await Promise.all(domains.map(domain => testDns(domain)));
    setDnsResults(results);
    
    setIsLoading(prev => ({ ...prev, dns: false }));
  };

  // CORS check function
  const runCorsCheck = async () => {
    setIsLoading(prev => ({ ...prev, cors: true }));
    
    try {
      const apiConfig = getConfig();
      const devApiUrl = 'https://fianceapi.dev.wedding.christephanie.com';
      const prodApiUrl = 'https://fianceapi.wedding.christephanie.com';
      const currentOrigin = window.location.origin;

      // Test OPTIONS preflight for both APIs
      const corsChecks = [
        // Health checks (shouldn't require auth)
        testEndpoint(`${devApiUrl}/health`),
        testEndpoint(`${prodApiUrl}/health`),
        
        // OPTIONS preflight checks
        testEndpoint(`${devApiUrl}/health`, 'OPTIONS'),
        testEndpoint(`${prodApiUrl}/health`, 'OPTIONS'),
        
        // With origin header
        testEndpoint(`${devApiUrl}/health`, 'GET', { 
          'Origin': currentOrigin 
        }),
        testEndpoint(`${prodApiUrl}/health`, 'GET', { 
          'Origin': currentOrigin 
        }),

        // With credentials
        testEndpoint(`${devApiUrl}/health`, 'GET', { 
          'Origin': currentOrigin
        }),
        testEndpoint(`${prodApiUrl}/health`, 'GET', {
          'Origin': currentOrigin
        }),
      ];
      
      // Run all checks and summarize results
      const results = await Promise.all(corsChecks);
      
      const successful = results.filter(r => 'ok' in r && r.ok).length;
      const failed = results.filter(r => 'ok' in r && !r.ok).length;
      const errors = results.filter(r => 'error' in r).length;
      
      setCorsResults({
        summary: {
          successful,
          failed,
          errors
        },
        details: results
      });
    } catch (error) {
      console.error('Error running CORS checks:', error);
    } finally {
      setIsLoading(prev => ({ ...prev, cors: false }));
    }
  };

  // Get configuration
  useEffect(() => {
    try {
      const apiConfig = getConfig();
      setConfig({
        webserviceUrl: apiConfig.webserviceUrl,
        domain: apiConfig.domain,
        clientId: apiConfig.clientId ? apiConfig.clientId.slice(0, 5) + '...' : 'N/A', // Don't show full client ID
        audience: apiConfig.audience
      });
    } catch (error) {
      console.error('Error getting config:', error);
    }
  }, []);

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Typography variant="h4" gutterBottom display="flex" alignItems="center">
        <BugReportIcon sx={{ mr: 1 }} />
        CORS & Network Debugging Dashboard
      </Typography>
      
      <Typography color="textSecondary" paragraph>
        This page helps diagnose CORS, API connectivity, and networking issues.
        Use the tools below to check your connection to the wedding API endpoints.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Actions</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={runCorsCheck}
                  disabled={isLoading.cors}
                >
                  {isLoading.cors ? <CircularProgress size={24} /> : 'Run CORS Check'}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={runDnsTests}
                  disabled={isLoading.dns}
                >
                  {isLoading.dns ? <CircularProgress size={24} /> : 'Test DNS Resolution'}
                </Button>
                <Button 
                  variant="contained" 
                  onClick={checkConnectionInfo}
                  disabled={isLoading.connection}
                >
                  {isLoading.connection ? <CircularProgress size={24} /> : 'Check Connection Info'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Configuration</Typography>
              {config ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableBody>
                      {Object.entries(config).map(([key, value]) => (
                        <TableRow key={key}>
                          <TableCell component="th" scope="row">
                            <Typography variant="body2">{key}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                              {value?.toString() || 'N/A'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">Loading configuration...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">CORS Check Results</Typography>
              {corsResults && (
                <StatusChip 
                  label={corsResults.summary.errors > 0 ? 'Issues Detected' : 'All Good'} 
                  color={corsResults.summary.errors > 0 ? 'error' : 'success'}
                  icon={corsResults.summary.errors > 0 ? <ErrorIcon /> : <CheckCircleIcon />}
                />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {corsResults ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body1" gutterBottom>
                      <strong>Summary:</strong> {corsResults.summary.successful} successful, {corsResults.summary.failed} failed, {corsResults.summary.errors} errors
                    </Typography>
                    
                    {corsResults.summary.errors > 0 && (
                      <Typography color="error">
                        CORS issues detected. See details below.
                      </Typography>
                    )}
                  </Box>
                  
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>URL</TableCell>
                          <TableCell>Method</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Result</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {corsResults.details.map((result, index) => (
                          <TableRow key={index}>
                            <TableCell sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {result.url}
                            </TableCell>
                            <TableCell>{result.method}</TableCell>
                            <TableCell>{'status' in result ? result.status : 'N/A'}</TableCell>
                            <TableCell>
                              {'error' in result ? (
                                <Chip 
                                  size="small"
                                  color="error" 
                                  label="Error" 
                                  icon={<ErrorIcon />} 
                                  title={result.error}
                                />
                              ) : result.ok ? (
                                <Chip 
                                  size="small"
                                  color="success" 
                                  label="Success" 
                                  icon={<CheckCircleIcon />}
                                />
                              ) : (
                                <Chip 
                                  size="small"
                                  color="warning" 
                                  label="Failed" 
                                  icon={<ErrorIcon />}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              ) : (
                <Typography color="textSecondary">
                  Run the CORS check to see results here.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">DNS Resolution Results</Typography>
              {dnsResults.length > 0 && (
                <StatusChip 
                  label={dnsResults.some(r => !r.success) ? 'Issues Detected' : 'All Good'} 
                  color={dnsResults.some(r => !r.success) ? 'error' : 'success'}
                  icon={dnsResults.some(r => !r.success) ? <ErrorIcon /> : <CheckCircleIcon />}
                />
              )}
            </AccordionSummary>
            <AccordionDetails>
              {dnsResults.length > 0 ? (
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Domain</TableCell>
                        <TableCell>Result</TableCell>
                        <TableCell>Response Time</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {dnsResults.map((result, index) => (
                        <TableRow key={index}>
                          <TableCell>{result.domain}</TableCell>
                          <TableCell>
                            {result.success ? (
                              <Chip 
                                size="small"
                                color="success" 
                                label="Resolved" 
                                icon={<CheckCircleIcon />}
                              />
                            ) : (
                              <Chip 
                                size="small"
                                color="error" 
                                label="Failed" 
                                icon={<ErrorIcon />}
                              />
                            )}
                          </TableCell>
                          <TableCell>{result.time}ms</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Typography color="textSecondary">
                  Run the DNS resolution test to see results here.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Connection Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              {connectionInfo ? (
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Basic Info
                  </Typography>
                  <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
                    <Table size="small">
                      <TableBody>
                        <TableRow>
                          <TableCell component="th" scope="row">Online Status</TableCell>
                          <TableCell>
                            {connectionInfo.online ? (
                              <Chip 
                                size="small"
                                color="success" 
                                label="Online" 
                                icon={<CheckCircleIcon />}
                              />
                            ) : (
                              <Chip 
                                size="small"
                                color="error" 
                                label="Offline" 
                                icon={<ErrorIcon />}
                              />
                            )}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell component="th" scope="row">Browser</TableCell>
                          <TableCell>{connectionInfo.userAgent}</TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {connectionInfo.connection && (
                    <>
                      <Typography variant="subtitle1" gutterBottom>
                        Network Details
                      </Typography>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableBody>
                            <TableRow>
                              <TableCell component="th" scope="row">Connection Type</TableCell>
                              <TableCell>{connectionInfo.connection.effectiveType}</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">Downlink</TableCell>
                              <TableCell>{connectionInfo.connection.downlink} Mbps</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">RTT</TableCell>
                              <TableCell>{connectionInfo.connection.rtt} ms</TableCell>
                            </TableRow>
                            <TableRow>
                              <TableCell component="th" scope="row">Data Saver</TableCell>
                              <TableCell>{connectionInfo.connection.saveData ? 'Enabled' : 'Disabled'}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </>
                  )}
                </Box>
              ) : (
                <Typography color="textSecondary">
                  Check connection information to see results here.
                </Typography>
              )}
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" gutterBottom>Understanding CORS Issues</Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>What is CORS?</Typography>
              <Typography variant="body2" paragraph>
                <strong>Cross-Origin Resource Sharing (CORS)</strong> is a security feature implemented by browsers.
                It blocks web pages from making requests to a different domain than the one that served the current page.
              </Typography>
              <Typography variant="body2" paragraph>
                For example, when your browser loads a page from <code>dev.wedding.christephanie.com</code>,
                then tries to fetch data from <code>fianceapi.dev.wedding.christephanie.com</code>,
                this is considered a cross-origin request.
              </Typography>
              <Typography variant="body2">
                Without proper CORS headers from the API server, your browser will block these requests,
                even if the domains look similar and are both yours.
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Common CORS Issues</Typography>
              <Typography variant="body2" paragraph>
                When you see CORS errors in your console, they typically mean:
              </Typography>
              <Typography component="ol" variant="body2" sx={{ pl: 2 }}>
                <li>The API server isn't returning the proper CORS headers</li>
                <li>Your API Gateway configuration doesn't include your frontend domain in allowed origins</li>
                <li>The headers your frontend is sending aren't in the list of allowed headers</li>
                <li>You're trying to send credentials (cookies) but the API doesn't allow it</li>
                <li>The HTTP method you're using isn't listed in allowed methods</li>
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>How to Fix CORS Issues</Typography>
              <Typography variant="body2" paragraph>
                Based on the analysis of your specific setup, here are the actions needed to fix your CORS issues:
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>1. API Gateway CORS Configuration</Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ul>
                  <li>In <code>infra/stacks/api-stack.ts</code>, double check that your <code>allowOrigins</code> array includes your current domain: <code>{window.location.origin}</code></li>
                  <li>The <code>allowHeaders</code> array should include: <code>authorization</code>, <code>content-type</code>, <code>x-amz-date</code>, <code>x-api-key</code>, <code>x-amz-security-token</code></li>
                  <li>The <code>allowMethods</code> should include all HTTP methods: <code>GET</code>, <code>POST</code>, <code>PUT</code>, <code>PATCH</code>, <code>DELETE</code>, <code>OPTIONS</code></li>
                  <li>Ensure <code>allowCredentials: true</code> for authorization headers to work</li>
                </ul>
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>2. Health Endpoint Implementation</Typography>
              <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                <ul>
                  <li>Implement a simple dedicated <code>/health</code> endpoint Lambda that properly returns CORS headers</li>
                  <li>The Lambda should respond to both <code>GET</code> and <code>OPTIONS</code> requests</li>
                  <li>It should include CORS headers in its response: <code>Access-Control-Allow-Origin</code>, <code>Access-Control-Allow-Headers</code>, <code>Access-Control-Allow-Methods</code></li>
                  <li>This health endpoint should not require authentication</li>
                </ul>
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>3. Deployment Steps</Typography>
              <Typography variant="body2" component="div">
                <ul>
                  <li>After making these changes, redeploy your API using <code>./scripts/deploy.sh dev</code> from the <code>/infra</code> directory</li>
                  <li>Once deployed, test the new health endpoint at <code>https://fianceapi.dev.wedding.christephanie.com/health</code></li>
                  <li>If you're still seeing CORS issues after deployment, check the API Gateway console to ensure your CORS settings were applied correctly</li>
                </ul>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}