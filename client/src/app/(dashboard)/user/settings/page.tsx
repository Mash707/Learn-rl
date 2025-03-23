import SharedNoticationSettings from '@/components/SharedNoticationSettings '
import React from 'react'

const UserSettings = () => {
  return (
    <div className='w-3/5'>
        <SharedNoticationSettings
            title="User settings"
            subtitle='Manage your notification settings'
        />
    </div>
  )
}

export default UserSettings