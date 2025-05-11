import pandas as pd
import shutil
import zipfile
import os
import tempfile


def unzip(zip_path):
    """
    Unzips the given .zip archive and converts each file into a Pandas DataFrame.

    Args:
        zip_path (str): Path to the .zip archive.

    Returns:
        dict: A dictionary where keys are filenames and values are Pandas DataFrames.
    """
    dataframes = {}
    zf = zipfile.ZipFile(zip_path)
    zf_name = list(zf.NameToInfo.keys())[0]
    # Unzip the archive
    with tempfile.TemporaryDirectory() as tempdir:
        zf.extractall(tempdir)
        # Iterate over extracted files and create DataFrames
        extracted_dir = os.listdir(os.path.join(tempdir, zf_name))
        for file_name in extracted_dir:
            file_path = os.path.join(tempdir, zf_name, file_name)
            if file_name.endswith(".csv") or file_name.endswith(".txt"):
                dataframes[file_name] = pd.read_csv(file_path)
            else:
                raise ValueError(f"Unsupported file format encountered: {file_name}")

    return dataframes
