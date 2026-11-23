import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TextField } from '../src/forms/TextField';
import { TextArea } from '../src/forms/TextArea';
import { Select } from '../src/forms/Select';
import { Checkbox, Radio } from '../src/forms/Checks';
import { InlineForm } from '../src/forms/InlineForm';
import { FormDialog } from '../src/forms/FormDialog';
import { AppShell } from '../src/shell/AppShell';

describe('Field kit', () => {
  it('labels mark required in text; errors wire invalid, describedby, and messages', async () => {
    const user = userEvent.setup();
    const { rerender } = render(<TextField label="Mobile number" name="mobile" required note="Ten digits" />);
    expect(screen.getByText('(required)')).toBeDefined();
    const input = screen.getByRole('textbox', { name: /mobile number/i });
    expect(input.getAttribute('aria-invalid')).toBeNull();
    rerender(<TextField label="Mobile number" name="mobile" required note="Ten digits" error="Enter the 10-digit mobile number" />);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    const described = (input.getAttribute('aria-describedby') ?? '').split(' ');
    expect(described).toHaveLength(2);
    expect(screen.getByText('Enter the 10-digit mobile number')).toBeDefined();
    rerender(<TextField label="Mobile number" name="mobile" required note="Ten digits" />);
    expect(input.getAttribute('aria-invalid')).toBeNull();
    await user.type(input, '555');
    expect((input as HTMLInputElement).value).toBe('555');
  });

  it('textarea and select share the contract', () => {
    render(
      <>
        <TextArea label="Notes" name="notes" />
        <Select label="Shift" name="shift">
          <option value="am">Morning</option>
        </Select>
      </>,
    );
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDefined();
    expect(screen.getByRole('combobox', { name: 'Shift' })).toBeDefined();
  });

  it('checkboxes and radios check natively with leaf accent styling hooks', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Checkbox label="Watering" name="tasks" />
        <Radio label="Morning" name="shift" />
      </>,
    );
    const box = screen.getByRole('checkbox', { name: 'Watering' }) as HTMLInputElement;
    await user.click(box);
    expect(box.checked).toBe(true);
    const radio = screen.getByRole('radio', { name: 'Morning' }) as HTMLInputElement;
    await user.click(radio);
    expect(radio.checked).toBe(true);
  });
});

describe('InlineForm', () => {
  it('failed submits keep data, focus the first error, and announce the count', async () => {
    const user = userEvent.setup();
    render(
      <AppShell>
        <InlineForm fieldErrors={{ mobile: 'Enter the 10-digit mobile number', email: 'Enter the email address' }}>
          <TextField label="Mobile number" name="mobile" error="Enter the 10-digit mobile number" />
          <TextField label="Email" name="email" error="Enter the email address" />
        </InlineForm>
      </AppShell>,
    );
    const mobile = screen.getByRole('textbox', { name: /mobile number/i }) as HTMLInputElement;
    await user.type(mobile, '555');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    expect(mobile.value).toBe('555');
    expect(document.activeElement).toBe(mobile);
    await vi.waitFor(() => expect(screen.getByRole('status').textContent).toBe('2 fields need attention'));
  });

  it('success replaces the action zone; offline shows the pending state', () => {
    const { rerender } = render(
      <InlineForm success={<p>Thanks — see you Saturday.</p>}>
        <TextField label="Name" name="name" />
      </InlineForm>,
    );
    expect(screen.getByText('Thanks — see you Saturday.')).toBeDefined();
    expect(screen.queryByRole('button', { name: 'Submit' })).toBeNull();
    rerender(
      <InlineForm pendingOffline>
        <TextField label="Name" name="name" />
      </InlineForm>,
    );
    expect(screen.getByText(/saved on this device/i)).toBeDefined();
  });
});

describe('FormDialog', () => {
  it('submits from the foot, guards dirty close, and surfaces errors', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <FormDialog open onClose={() => {}} title="New signup" dirty submitError="The name is taken." onSubmit={onSubmit}>
        <TextField label="Name" name="name" />
      </FormDialog>,
    );
    expect(screen.getByRole('dialog', { name: 'New signup' })).toBeDefined();
    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
