import React, {useEffect, useState} from 'react'
import { ApiClient, useCurrentAdmin } from 'admin-bro'
import { Box,  Button } from '@admin-bro/design-system'
import styled from 'styled-components'
import axios from 'axios';

const ColabWrapper = styled(Box)`
    direction: ltr;
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 30px;
    box-sizing: border-box;
    background: #fff;

    .zui-table {
        border-radius: 3px;
        table-layout: fixed;
        min-width: 650px;
        width: 60%;

        thead {
            border: 1px solid #F6F7FB;
        }

        tbody {
            border: 1px solid #F6F7FB;
        }
    }

    .zui-table thead th {
        background: #F6F7FB;
        padding: 10px;
        text-align: left;
        font-weight: 400;
        z-index: -2px;
    }

    .zui-table tbody td {
        padding: 0;
        padding: 10px;
    }

    .zui-table-highlight-all {
        overflow: hidden;
    }
    .zui-table-highlight-all tbody td,
    .zui-table-highlight-all thead th {
        position: relative;
        z-index: 2;
    }

    .zui-table-highlight-all tbody td:hover {
        z-index: 1;
        &:not(.table-row-head)::before {
          background: rgba(64, 110, 232, 0.1);
          content: "";
          height: 100%;
          left: -100vw;
          position: absolute;
          top: 0;
          width: 200vw;
          z-index: -1 !important;
        }
    }
    .zui-table-highlight-all tbody td:hover {
        z-index: 1;
        &:not(.table-row-head)::after {
            background: rgba(64, 110, 232, 0.1);
            content: "";
            height: 200vh;
            left: 0;
            position: absolute;
            top: -100vh;
            width: 100%;
            z-index: -1 !important;

            
        }
    }

`

const SubmitBtn = styled(Button)`
    border-radius: 3px;
    margin-top: 20px;
    cursor: pointer;
`

const Colab = (props) => {
    const api = new ApiClient()
    const [users, setUsers] = useState([])
    const [currentAdmin, setCurrentAdmin] = useCurrentAdmin()

    useEffect(() => {
        api.resourceAction({ resourceId: 'User', actionName: 'list' }).then(results => {
            setUsers(results.data.records.map(el => el.params));
        })
    }, [])

    const handleInputChange = (event) => {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;
        const divider = name.indexOf("|");
        const userId = name.substr(0, divider);
        const property = name.substr(divider + 1);
        setUsers((prevState) => {
            return prevState.map(el => {
                if(el._id == userId) {
                    return {...el, [property]: value}
                }
                return el
            })
        })
    }

    const submitChanges = async () => {
        const host = "//site:8080"
        const userData = users.map(el => ({_id: el._id, isVerified: el.isVerified, isAdmin:el.isAdmin, studyMode: el.studyMode, isColabMode:el.isColabMode, logData: el.logData}))
        await axios.patch(`${host}/users/update`, userData);
    }


    return (
        <ColabWrapper>
      <table className="zui-table zui-table-highlight-all">
        <thead>
          <tr>
            <th colSpan="5">User</th>
            <th>Study Mode</th>
            <th>Is Colab Mode</th>
            <th>Is Verifed</th>
            <th>Is Admin</th>
            <th>Log Data</th>
          </tr>
        </thead>
        <tbody>
          {users && users.map((user, index) => {
             const {email, _id, studyMode, isColabMode,  isVerified, isAdmin, logData} = users[index];
            return (
              <tr key={email}>
                <td colSpan="5">
                    {email}
                </td>
                <td>
                    <input 
                        type="checkbox"
                        name={`${_id}|studyMode`}
                        checked={studyMode}
                        onChange={handleInputChange} />
                </td>
                <td>
                    <input 
                        type="checkbox"
                        name={`${_id}|isColabMode`}
                        checked={isColabMode}
                        onChange={handleInputChange} />
                </td>
                <td>
                    <input 
                        type="checkbox"
                        name={`${_id}|isVerified`}
                        checked={isVerified}
                        onChange={handleInputChange} />
                </td>
                <td>
                    <input 
                        type="checkbox"
                        name={`${_id}|isAdmin`}
                        checked={isAdmin}
                        onChange={handleInputChange} />
                </td>
                <td>
                    <input 
                        type="checkbox"
                        name={`${_id}|logData`}
                        checked={logData}
                        onChange={handleInputChange} />
                </td>
              </tr>
            );
          })}

        </tbody>
      </table>
      <SubmitBtn variant="primary" size="lg" onClick={submitChanges}>Submit Changes</SubmitBtn>
    </ColabWrapper>
    )
}

export default Colab