import React from 'react';

const UpdateHelp = () => (
  <div style={{ padding: '1rem' }}>
    <h2>How to Update the App</h2>
    <ol>
      <li>Go to the Dashboard and click <b>Check for Updates</b>.</li>
      <li>If an update is available, click <b>Update Now</b> and follow the prompts.</li>
      <li>After download, click <b>Restart to Install</b> if prompted.</li>
    </ol>
    <h3>Troubleshooting</h3>
    <ul>
      <li>Ensure you have an internet connection.</li>
      <li>If the update fails, try again or download the latest version from GitHub.</li>
    </ul>
    <h3>More Help</h3>
    <p>See the <a href="https://github.com/kuntz09matthew/Financial-Assistance-App" target="_blank" rel="noopener noreferrer">project GitHub page</a> for more details.</p>
  </div>
);

export default UpdateHelp;
