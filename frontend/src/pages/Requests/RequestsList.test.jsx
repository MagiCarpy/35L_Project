//I asked ChatGPT to help me write this test file
//Prompt:
/*
I'm now investigating the broken redirect in RequestsList.jsx. 
I previously replaced window.location.href with navigate(). 
Behavior: The user's feedback, "when I click on it now it doesn't redirect," suggests a potential issue with the navigate() implementation.

Task:Create a test file for RequestsList.jsx that tests the redirect functionality.
*/

import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import RequestsList from './RequestsList';
import { AuthProvider } from '../../context/AuthContext';

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
    useAuth: () => ({
        user: { userId: 'test-user-id' },
    }),
}));

// Mock fetch
global.fetch = vi.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({
            requests: [
                {
                    id: 'req-1',
                    item: 'Test Item',
                    pickupLocation: 'Loc A',
                    dropoffLocation: 'Loc B',
                    status: 'open',
                    userId: 'test-user-id', // User is the owner
                    pickupLat: 0,
                    pickupLng: 0,
                },
            ],
        }),
    })
);

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('RequestsList', () => {
    it('navigates to details page when Chat/Details button is clicked', async () => {
        render(
            <BrowserRouter>
                <RequestsList />
            </BrowserRouter>
        );

        // Wait for requests to load (simplified for this example)
        const button = await screen.findByText('Chat / Details');
        fireEvent.click(button);

        expect(mockNavigate).toHaveBeenCalledWith('/requests/req-1');
    });
});
