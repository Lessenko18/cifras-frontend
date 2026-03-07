import styled from "styled-components";

export const UsersContainer = styled.section`
  max-width: 1200px;
  width: 100%;
  margin: 0 auto 50px;
  display: grid;
  gap: 40px;
`;
export const UsersHeader = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  text-align: center;
  align-items: center;

  > :first-child {
    justify-self: start;
  }

  > :nth-child(2) {
    justify-self: center;
    text-align: center;
    margin: 0;
    min-width: 0;
  }

  > :last-child {
    justify-self: end;
  }

  button {
    max-width: fit-content;
  }
  .btn {
    margin: 0;
  }

  gap: 20px;

  @media (max-width: 700px) {
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 10px;
  }

  @media (max-width: 430px) {
    gap: 6px;
  }

  .btns-header {
    display: flex;
    align-items: center;
    max-width: fit-content;
    margin-left: auto;
    gap: 13px;
    img {
      max-width: 35px;
    }
    @media only screen and (max-width: 700px) {
      img {
        max-width: 25px;
      }
    }
  }
`;
export const UsersBody = styled.div`
  display: grid;
  justify-items: center;
  gap: 10px;
`;
export const ModalUser = styled.form`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 440px;
  width: 100%;
  margin: 15px auto;
  border: 1px solid #000;
  display: grid;
  gap: 15px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  div {
    display: grid;
    gap: 3px;
  }

  .modal-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: nowrap;
  }

  h3 {
    font-size: 22px;
    margin: 0 auto;
    font-weight: 500;
  }
  #inputLevel {
    display: flex;
    align-items: center;
  }
`;
export const AnUser = styled.article`
  border: 1px solid #000;
  background-color: #ffff;
  padding: 10px 15px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
  max-width: 700px;
  width: 100%;
  border-radius: 10px;
  box-shadow: 0px 0px 5px #1818186a;

  div {
    display: flex;
    gap: 10px;
    align-items: center;
  }
`;
export const ModalDelete = styled.div`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 440px;
  margin: 15px auto;
  text-align: center;
  border: 1px solid #000;
  display: grid;
  gap: 15px;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
  div {
    display: flex;
    justify-content: center;
    gap: 8px;
  }
`;

export const ModalEdit = styled.form`
  background-color: var(--light);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 5px 15px -5px #1a1a1a8d;
  max-width: 440px;
  width: 100%;
  margin: 15px auto;
  border: 1px solid #000;

  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);

  h3 {
    margin: 0 0 10px;
    padding-right: 70px;
  }

  > div {
    display: grid;
    gap: 10px;
  }

  .modal-actions {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    flex-wrap: nowrap;
  }

  #inputLevel {
    display: flex;
    align-items: center;
  }
  .user-foto {
    width: 56px;
    height: 56px;
    object-fit: cover;
    border-radius: 10px;
    position: absolute;
    top: 20px;
    right: 20px;
    display: block;
    margin: 0;
    border: 1px solid #000;
  }

  .user-foto-fallback {
    width: 56px;
    height: 56px;
    border-radius: 10px;
    border: 1px solid #000;
    background: #e8ecf2;
    color: #1f2d3d;
    position: absolute;
    top: 20px;
    right: 20px;
    display: grid;
    place-items: center;
    font-size: 32px;
    font-weight: 700;
    margin: 0;
  }
`;
