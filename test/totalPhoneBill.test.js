import { expect } from 'chai';
import { totalPhoneBill } from '../totalPhoneBill.js';

describe('totalPhoneBill', () => {
    it('should calculate the total bill for a string of calls and sms', () => {
        const result = totalPhoneBill('call, sms, call, sms, sms', 0.75, 2.50);
        expect(result).to.equal('R8.25');
    });

    it('should calculate the total bill for an array of calls and sms', () => {
        const result = totalPhoneBill(['call', 'sms', 'call', 'sms', 'sms'], 0.75, 2.50);
        expect(result).to.equal('R8.25');
    });

    it('should calculate the total bill for an object of calls and sms', () => {
        const result = totalPhoneBill({ one: 'call', two: 'sms', three: 'call', four: 'sms', five: 'sms' }, 0.75, 2.50);
        expect(result).to.equal('R8.25');
    });

    it('should throw an error for unsupported data types', () => {
        expect(() => totalPhoneBill(12345, 0.75, 2.50)).to.throw("Unsupported data type for 'bill'");
    });

    it('should handle empty string', () => {
        const result = totalPhoneBill('', 0.75, 2.50);
        expect(result).to.equal('R0.00');
    });

    it('should handle an empty array', () => {
        const result = totalPhoneBill([], 0.75, 2.50);
        expect(result).to.equal('R0.00');
    });

    it('should handle an empty object', () => {
        const result = totalPhoneBill({}, 0.75, 2.50);
        expect(result).to.equal('R0.00');
    });
});
