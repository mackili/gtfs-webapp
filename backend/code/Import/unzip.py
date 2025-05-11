import pandas as pd
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
    # Open the zip file
    with zipfile.ZipFile(zip_path, "r") as zf:
        # Create a temporary directory to extract files
        with tempfile.TemporaryDirectory() as tempdir:
            zf.extractall(tempdir)
            # Iterate over extracted files and create DataFrames
            for file_name in os.listdir(tempdir):
                file_path = os.path.join(tempdir, file_name)
                if os.path.isfile(file_path):  # Ensure it's a file
                    if file_name.endswith(".csv") or file_name.endswith(".txt"):
                        dataframes[file_name] = pd.read_csv(file_path)
                    else:
                        raise ValueError(
                            f"Unsupported file format encountered: {file_name}"
                        )

    return dataframes
