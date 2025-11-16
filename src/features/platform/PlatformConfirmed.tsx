import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { apiClient } from '@/shared/lib/api-client';
import { workflowNodesService } from '@/shared/services/workflowNodesService';

const PlatformConfirmed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        // Extract only the code parameter from the URL
        const code = searchParams.get('code');
        
        if (!code) {
          setStatus('error');
          setErrorMessage('No authorization code found in the callback URL');
          return;
        }

        // Retrieve stored context from localStorage
        const contextStr = localStorage.getItem('tiktok_oauth_context');
        if (!contextStr) {
          setStatus('error');
          setErrorMessage('OAuth context not found. Please try connecting again from the editor.');
          return;
        }

        let context: { taskId: string; nodeId: string; nodeType: string; position: { x: number; y: number } };
        try {
          context = JSON.parse(contextStr);
        } catch (parseError) {
          setStatus('error');
          setErrorMessage('Invalid OAuth context. Please try connecting again.');
          return;
        }

        // Create workflow node to get workflow_node_id
        try {
          const workflowNodeResponse = await workflowNodesService.createWorkflowNode(
            context.nodeId,
            context.taskId,
            context.position,
            context.nodeType,
            null, // node_key
            null, // string_value
            null, // numeric_value
            null, // timestamp_value
            null  // attributes
          );

          // Extract workflow_node_id from response
          // Response structure could be { data: { id: string } } or { data: string } or { data: { workflow_node_id: string } }
          let workflowNodeId: string | undefined;
          const responseData = workflowNodeResponse.data;
          
          if (typeof responseData === 'string') {
            workflowNodeId = responseData;
          } else if (typeof responseData === 'object' && responseData !== null) {
            workflowNodeId = (responseData as { id?: string; workflow_node_id?: string }).id 
              || (responseData as { id?: string; workflow_node_id?: string }).workflow_node_id;
          }
          
          if (!workflowNodeId) {
            console.error('Workflow node response:', workflowNodeResponse);
            setStatus('error');
            setErrorMessage('Failed to get workflow node ID from response. Please try again.');
            return;
          }

          // Send both code and workflow_node_id to the API
          // POST /client/store/tiktok/config
          await apiClient.post('/client/store/tiktok/config', { 
            code,
            workflow_node_id: workflowNodeId
          });

          // Clean up stored context
          localStorage.removeItem('tiktok_oauth_context');
          
          setStatus('success');
          
          // Redirect to editor after a short delay
          setTimeout(() => {
            navigate('/editor');
          }, 2000);
        } catch (apiError) {
          console.error('Error in OAuth callback:', apiError);
          setStatus('error');
          setErrorMessage(
            apiError instanceof Error 
              ? apiError.message 
              : 'Failed to connect TikTok account. Please try again.'
          );
        }
      } catch (error) {
        console.error('Error handling OAuth callback:', error);
        setStatus('error');
        setErrorMessage('An unexpected error occurred');
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        {status === 'loading' && (
          <>
            <div className="inline-block w-12 h-12 border-4 border-gray-300 border-t-[#f65e05] rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting TikTok Account</h2>
            <p className="text-gray-600">Please wait while we connect your account...</p>
          </>
        )}
        
        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Successfully Connected!</h2>
            <p className="text-gray-600 mb-4">Your TikTok account has been connected successfully.</p>
            <p className="text-sm text-gray-500">Redirecting to editor...</p>
          </>
        )}
        
        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Failed</h2>
            <p className="text-gray-600 mb-4">{errorMessage}</p>
            <button
              onClick={() => navigate('/editor')}
              className="px-4 py-2 text-sm font-medium text-white bg-[#f65e05] rounded-md hover:bg-[#dd5504]"
            >
              Return to Editor
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PlatformConfirmed;

