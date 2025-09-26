import styled from "styled-components";

export const MultSeletorContainer = styled.div`
  display: grid;
  gap: 7px;
    h3 {
        font-size: 20px;
        font-weight: 600;
    }
    &>p {
    /* box-shadow: 0 0 20px #cfcfcf97 inset; */
    background-color: #ffffff;
    border-radius: 10px;
    padding: 10px;
    padding-right: 15px;
    max-width: 400px;
    width: 100%;
    position: relative;
  }
`;
export const GuardaEscolhidos = styled.div`
  display: grid;
  gap: 7px;
  border-bottom: 1px solid var(--dark);
  margin-bottom: 10px;
  padding-bottom: 10px;
  p {
    /* box-shadow: 0 0 20px #cfcfcf97 inset; */
  background: linear-gradient(to right, var(--dark), var(--main));
    border-radius: 10px;
    padding: 10px;
    color: #fff;
    padding-right: 15px;
    max-width: 400px;
    width: 100%;
    position: relative;
    .remove {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      color: #ff0000;
      cursor: pointer;
      font-weight: 900;
      background-color: #fff;
      height: 25px;
      width: 25px;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 50px;
    }
  }
`;
