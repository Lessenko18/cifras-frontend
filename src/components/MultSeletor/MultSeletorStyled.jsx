import styled from "styled-components";

export const MultSeletorContainer = styled.div`
  display: grid;
  gap: 7px;
  h3 {
    font-size: 20px;
    font-weight: 600;
  }
  & > p {
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
    background: linear-gradient(to right, var(--dark), var(--main));
    border-radius: 10px;
    padding: 10px;
    color: #fff;
    padding-right: 10px;
    max-width: 400px;
    width: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;

    &.reorderable {
      cursor: grab;
      user-select: none;
    }

    &.dragging {
      opacity: 0.65;
    }

    &.drag-over {
      outline: 2px dashed rgba(255, 255, 255, 0.8);
      outline-offset: 2px;
    }

    .item-content {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      padding-right: 4px;
    }

    .item-actions {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-shrink: 0;
    }

    .drag-handle {
      font-weight: 900;
      letter-spacing: 1px;
      opacity: 0.85;
      cursor: grab;
      padding: 2px 4px;
    }

    .remove {
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
