import React from 'react'
import { Select } from './components/ui/Select'

export const Test: React.FC = () => {

    const [gender, setGender] = React.useState<'Male'|'Female'|'Other'|undefined>(undefined);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setGender(e.target.value as 'Male'|'Female'|'Other');
        console.log(gender);
    }

    return (
        <>
            <Select
                label="Gender"
                value={gender || ''}
                onChange={handleChange}
                name='gender'
                option={[
                    {value: 'Male', label: 'Male'},
                    {value: 'Female', label: 'Female'},
                    {value: 'Other', label: 'Other'},
                ]} />

                <button onClick={() => console.log(gender)}>Log</button>
        </>
    )
}
